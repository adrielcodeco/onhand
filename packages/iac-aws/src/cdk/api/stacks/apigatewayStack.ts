import _ from 'lodash'
import * as cdk from '@aws-cdk/core'
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as lambda from '@aws-cdk/aws-lambda'
import * as cr from '@aws-cdk/custom-resources'
import * as iam from '@aws-cdk/aws-iam'
import * as logs from '@aws-cdk/aws-logs'
import * as acm from '@aws-cdk/aws-certificatemanager'
import * as route53 from '@aws-cdk/aws-route53'
import * as targets from '@aws-cdk/aws-route53-targets'
import Container, { Service } from 'typedi'
import { Options, resourceName } from '#/app/options'
import { FunctionOptions } from '#/app/functions'
import { getApiGatewayStackName } from '#/cdk/resources'

@Service()
export class ApiGatewayStack extends cdk.NestedStack {
  private readonly functions!: FunctionOptions[]
  private apiResource!: apigateway.IResource
  private apiGatewayRole!: iam.Role
  private api!: apigateway.RestApi
  private readonly authorizers = new Map<string, apigateway.IAuthorizer>()

  constructor (scope: cdk.Construct, private readonly options: Options) {
    super(scope, getApiGatewayStackName(options))

    this.functions = Container.get<FunctionOptions[]>('functions')

    this.createRole()
    this.createApiGateway()
    this.createAuthorizerFunction()
    this.createRoutes()
    this.updateRoute53Records()
    if (this.options.stage === 'prd') {
      this.disableApigatewayDefaultEndpoint()
    }
  }

  private createRole () {
    this.apiGatewayRole = new iam.Role(
      this,
      resourceName(this.options, 'apiAuthorizerRole'),
      {
        assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      },
    )
  }

  private createApiGateway () {
    const domainNamePart: any = {}
    if (this.options.config?.cloudFront?.api?.domainName) {
      const certificateArn = ` arn:aws:acm:us-east-1:${
        this.account
      }:certificate/${
        this.options.config?.cloudFront?.api?.certificateId ?? ''
      }`
      const certificate = acm.Certificate.fromCertificateArn(
        this,
        resourceName(this.options, 'cert'),
        certificateArn,
      )
      domainNamePart.domainName = {
        domainName: this.options.config?.cloudFront?.api?.domainName,
        certificate: certificate,
        endpointType: apigateway.EndpointType.EDGE,
        securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
      }
    }

    const restApiName = resourceName(this.options, 'api')
    this.api = new apigateway.RestApi(this, restApiName, {
      restApiName,
      deployOptions: {
        stageName: this.options.stage,
        variables: {
          stage: this.options.stage,
        },
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        metricsEnabled: true,
        dataTraceEnabled: true,
      },
      ...domainNamePart,
      endpointConfiguration: {
        types: [apigateway.EndpointType.EDGE],
      },
      defaultCorsPreflightOptions: {
        allowCredentials:
          this.options.config?.apiGateway?.accessControlAllowCredentials ===
          undefined
            ? true
            : this.options.config?.apiGateway?.accessControlAllowCredentials,
        allowOrigins:
          this.options.config?.apiGateway?.accessControlAllowOrigin ??
          apigateway.Cors.ALL_ORIGINS,
        allowMethods:
          this.options.config?.apiGateway?.accessControlAllowMethods ??
          apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS.concat(
          this.options.config?.apiGateway?.accessControlAllowHeaders ?? [],
        ),
      },
    })
    Container.set('restApi', this.api)
    Container.set('restApiId', this.api.restApiId)

    this.apiResource = this.api.root

    const apiIdExportName = resourceName(this.options, 'apiId')
    const apiRootResourceIdExportName = resourceName(
      this.options,
      'apiRootResourceId',
    )
    // eslint-disable-next-line no-new
    new cdk.CfnOutput(this, apiIdExportName, {
      value: this.api.restApiId,
      exportName: apiIdExportName,
    })
    // eslint-disable-next-line no-new
    new cdk.CfnOutput(this, apiRootResourceIdExportName, {
      value: this.api.restApiRootResourceId,
      exportName: apiRootResourceIdExportName,
    })
  }

  private createAuthorizerFunction () {
    const authorizers = this.functions.filter(f => f.isAuthorizer)
    for (const { operationName, functionName } of authorizers) {
      const alias = this.options.stage
      const authorizerFunc = lambda.Function.fromFunctionArn(
        this,
        _.camelCase(functionName),
        `arn:aws:lambda:${this.region}:${this.account}:function:${functionName}:${alias}`,
      )
      this.createAuthAuthorizers(operationName, authorizerFunc)
    }
  }

  private createAuthAuthorizers (
    authorizer: string,
    authorizerFunction: lambda.IFunction,
  ) {
    const authorizerName = resourceName(this.options, [
      'authorizer',
      authorizer,
    ])
    const auth = new apigateway.RequestAuthorizer(this, authorizerName, {
      handler: authorizerFunction,
      identitySources: [
        apigateway.IdentitySource.header('Authorization'),
        apigateway.IdentitySource.header('scope'),
        apigateway.IdentitySource.header('deviceId'),
      ],
      assumeRole: this.apiGatewayRole,
      authorizerName,
      resultsCacheTtl: cdk.Duration.seconds(300),
    })
    this.authorizers.set(authorizer, auth)
  }

  private createRoutes () {
    const routes = this.functions.filter(f => f.path)

    for (const {
      operationName,
      functionName,
      authorizer,
      path,
      method,
    } of routes) {
      let parentResource: apigateway.IResource = this.apiResource
      const parts = path!.split('/').filter(p => !!p)
      for (const part of parts) {
        const resourceFound = parentResource.getResource(part)
        if (resourceFound) {
          parentResource = resourceFound
        } else {
          parentResource = this.addResource(parentResource, part)
        }
      }
      this.addMethod(
        parentResource,
        method!,
        operationName,
        functionName,
        authorizer!,
      )
    }
  }

  private addResource (resource: apigateway.IResource, name: string) {
    return resource.addResource(name)
  }

  private addMethod (
    resource: apigateway.IResource,
    method: string,
    operationName: string,
    functionName: string,
    authorizer: string,
  ) {
    const alias = this.options.stage
    const routeLambda = lambda.Function.fromFunctionArn(
      this,
      _.camelCase(`func-${operationName}`),
      `arn:aws:lambda:${this.region}:${this.account}:function:${functionName}:${alias}`,
    )
    resource.addMethod(
      method,
      new apigateway.LambdaIntegration(routeLambda, {
        proxy: true,
        allowTestInvoke: true,
      }),
      {
        operationName: operationName,
        authorizationType: authorizer
          ? apigateway.AuthorizationType.CUSTOM
          : undefined,
        authorizer: authorizer ? this.authorizers.get(authorizer) : undefined,
      },
    )
  }

  private disableApigatewayDefaultEndpoint () {
    const executeApi = resourceName(this.options, 'apiExecuteApiResource')
    const executeApiResource = new cr.AwsCustomResource(this, executeApi, {
      functionName: 'disableExecuteApiEndpoint',
      onCreate: {
        service: 'APIGateway',
        action: 'updateRestApi',
        parameters: {
          restApiId: this.api.restApiId,
          patchOperations: [
            {
              op: 'replace',
              path: '/disableExecuteApiEndpoint',
              value: 'True',
            },
          ],
        },
        physicalResourceId: cr.PhysicalResourceId.of(executeApi),
      },
      logRetention: logs.RetentionDays.ONE_DAY,
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['apigateway:PATCH'],
          resources: ['arn:aws:apigateway:*::/*'],
        }),
      ]),
    })
    executeApiResource.node.addDependency(this.api)
  }

  private updateRoute53Records () {
    if (this.options.config?.cloudFront?.api?.zoneName) {
      const zone = route53.PublicHostedZone.fromLookup(
        this,
        resourceName(this.options, 'hzApi'),
        {
          domainName: this.options.config?.cloudFront?.api?.zoneName,
        },
      )
      // eslint-disable-next-line no-new
      new route53.ARecord(this, resourceName(this.options, 'domainRecordApi'), {
        zone: zone,
        recordName: this.options.config?.cloudFront?.api?.domainName,
        target: route53.RecordTarget.fromAlias(
          new targets.ApiGateway(this.api),
        ),
        ttl: cdk.Duration.seconds(300),
      })
    }
  }
}
