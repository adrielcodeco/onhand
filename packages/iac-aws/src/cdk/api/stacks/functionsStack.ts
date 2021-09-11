/* eslint-disable no-new */
import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as s3 from '@aws-cdk/aws-s3'
import * as iam from '@aws-cdk/aws-iam'
import * as logs from '@aws-cdk/aws-logs'
import moment from 'moment'
import { Container } from 'typedi'
import { Options, resourceName } from '#/app/options'
import { customResource } from '#/cdk/api/customResource'
// eslint-disable-next-line max-len
import { Policy } from '@onhand/framework-aws/#/infrastructure/apigateway/metadata/policiesMetadata'
import { FunctionOptions } from '#/app/functions'
import {
  getFunctionsStackName,
  getReleasesBucketName,
  projectName,
  s3Arn,
} from '#/cdk/resources'

export class FunctionsStack extends cdk.NestedStack {
  private readonly bucket?: s3.IBucket
  private readonly project: string

  constructor (scope: cdk.Construct, private readonly options: Options) {
    super(scope, getFunctionsStackName(options))

    const bucketName = getReleasesBucketName(this.options)
    const s3AssetsArn = s3Arn(bucketName)
    this.bucket = s3.Bucket.fromBucketArn(this, bucketName, s3AssetsArn)

    this.project = projectName(this.options)
    this.createLambdasAndAliases()
    this.createSeedFunction()
  }

  private createLambdasAndAliases () {
    const functions = Container.get<FunctionOptions[]>('functions')
    const timekey = moment().format('YYYYMMDDhhmm')

    const { resource: rolesFunction, roles } = this.createRolesFunction(
      functions,
      timekey,
    )
    const { resource: functionsFunction, versions } =
      this.createFunctionsFunction(functions, roles)
    const { resource: aliasesFunction } = this.createAliasesFunction(
      functions,
      versions,
    )

    aliasesFunction.node.addDependency(functionsFunction)
    functionsFunction.node.addDependency(rolesFunction)
  }

  private createRolesFunction (functions: FunctionOptions[], timekey: string) {
    const functionName = 'onhand-roles-function'
    const functionPolicy: Policy = {
      inlinePolicy: {
        actions: [
          'iam:CreateRole',
          'iam:AttachRolePolicy',
          'iam:PutRolePolicy',
          'iam:PassRole',
          'iam:TagRole',
        ],
        effect: 'Allow',
        resources: ['*'],
      },
    }
    const policies: Policy[] = [functionPolicy]
    const func = this.createFunction(functionName, '', policies)

    const resource = customResource(this, functionName, func, this.options, {
      functions: JSON.stringify(functions),
      region: this.region,
      account: this.account,
      timekey,
      project: this.project,
    })

    const roles = resource.getAtt('result')
    return {
      resource,
      roles,
    }
  }

  private createFunctionsFunction (functions: FunctionOptions[], roles: any) {
    const functionName = 'onhand-functions-function'
    const functionPolicy: Policy = {
      inlinePolicy: {
        actions: [
          'lambda:GetFunction',
          'lambda:CreateFunction',
          'lambda:UpdateFunctionConfiguration',
          'lambda:UpdateFunctionCode',
          'iam:PassRole',
          'iam:TagRole',
          's3:GetObject*',
          's3:GetBucket*',
          's3:List*',
          's3:DeleteObject*',
          's3:PutObject*',
          's3:Abort*',
        ],
        effect: 'Allow',
        resources: ['*'],
      },
    }
    const policies: Policy[] = [functionPolicy]
    const func = this.createFunction(functionName, '', policies)

    const resource = customResource(this, functionName, func, this.options, {
      functions: JSON.stringify(functions),
      roles,
      project: this.project,
    })

    const versions = resource.getAtt('result')
    return {
      resource,
      versions,
    }
  }

  private createAliasesFunction (functions: FunctionOptions[], versions: any) {
    const functionName = 'onhand-aliases-function'
    const functionPolicy: Policy = {
      inlinePolicy: {
        actions: [
          'lambda:GetAlias',
          'lambda:CreateAlias',
          'lambda:DeleteAlias',
        ],
        effect: 'Allow',
        resources: ['*'],
      },
    }
    const policies: Policy[] = [functionPolicy]
    const func = this.createFunction(functionName, '', policies)

    const resource = customResource(this, functionName, func, this.options, {
      functions: JSON.stringify(functions),
      versions,
      stage: this.options.stage,
    })

    return {
      resource,
    }
  }

  private createSeedFunction () {
    const functionName = 'onhand-seed-function'
    const dynamoDBPolicy: Policy = { managedPolicy: 'AmazonDynamoDBFullAccess' }
    const s3Policy: Policy = { managedPolicy: 'AmazonS3FullAccess' }
    const policies: Policy[] = [dynamoDBPolicy, s3Policy]
    return this.createFunction(functionName, '', policies)
  }

  private createFunction (
    operationName: string,
    description: string,
    policies: Policy[],
  ) {
    const functionName = resourceName(this.options, operationName, true)
    const lambdaRole = new iam.Role(this, `func-${operationName}-role`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    })
    const logPolicy: Policy = {
      inlinePolicy: {
        actions: ['logs:*'],
        effect: 'Allow',
        resources: [
          `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/lambda/${functionName}:*`,
        ],
      },
    }
    for (const policy of policies.concat([logPolicy])) {
      if ('managedPolicy' in policy) {
        lambdaRole.addManagedPolicy(
          iam.ManagedPolicy.fromAwsManagedPolicyName(policy.managedPolicy),
        )
      }
      if ('inlinePolicy' in policy) {
        lambdaRole.attachInlinePolicy(
          new iam.Policy(
            this,
            `policy-${operationName}-${policies.indexOf(policy)}`,
            {
              document: new iam.PolicyDocument({
                statements: [
                  new iam.PolicyStatement({
                    actions: policy.inlinePolicy.actions,
                    effect: policy.inlinePolicy.effect as any,
                    resources: policy.inlinePolicy.resources,
                  }),
                ],
              }),
            },
          ),
        )
      }
    }
    const func = new lambda.Function(this, `func-${operationName}`, {
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      description: `${
        description ? description + ' - ' : ''
      }deployed on: ${new Date().toISOString()}`,
      functionName,
      code: lambda.Code.fromBucket(
        this.bucket!,
        `${this.project}-${
          this.options.packageVersion ?? ''
        }/${operationName}.zip`,
        undefined,
      ),
      currentVersionOptions: {
        description: this.options.packageVersion,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        retryAttempts: 1,
      },
      environment: {
        STAGE: this.options.stage,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      role: lambdaRole,
      memorySize: 256,
      reservedConcurrentExecutions: undefined,
      timeout: cdk.Duration.minutes(15),
    })
    cdk.Tags.of(func).add('onhandProject', this.project)
    cdk.Tags.of(func).add('onhandResource', 'function')
    cdk.Tags.of(func).add('onhandResourceGroup', 'pipeline')
    func.currentVersion.addAlias(this.options.stage)
    if (this.options.packageVersion) {
      func.currentVersion.addAlias(
        this.options.packageVersion.replace(/\./g, '-'),
      )
    }

    return func
  }
}
