/* eslint-disable no-new */
import _ from 'lodash'
import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as s3 from '@aws-cdk/aws-s3'
import * as iam from '@aws-cdk/aws-iam'
import * as logs from '@aws-cdk/aws-logs'
import Container, { Service } from 'typedi'
import { Options, resourceName } from '#/app/options'
// eslint-disable-next-line max-len
import { Policy } from '@onhand/framework-aws/#/infrastructure/apigateway/metadata/policiesMetadata'
import { FunctionOptions } from '#/app/functions'
import {
  getFunctionsStackName,
  getReleasesBucketName,
  projectName,
  s3Arn,
} from '#/cdk/resources'

@Service()
export class FunctionsStack extends cdk.NestedStack {
  private readonly bucket?: s3.IBucket
  private readonly project: string

  constructor (scope: cdk.Construct, private readonly options: Options) {
    super(scope, getFunctionsStackName(options))

    const bucketName = getReleasesBucketName(this.options)
    const s3AssetsArn = s3Arn(bucketName)
    this.bucket = s3.Bucket.fromBucketArn(
      this,
      _.camelCase(bucketName),
      s3AssetsArn,
    )

    this.project = projectName(this.options)
    this.createLambdasAndAliases()
    this.createSeedFunction()
  }

  private createLambdasAndAliases () {
    const functions = Container.get<FunctionOptions[]>('functions')

    for (const func of functions) {
      this.createFunction(func, [
        { key: 'onhandProject', value: this.project },
        { key: 'onhandOperationId', value: func.operationName },
        { key: 'onhandResource', value: 'function' },
        { key: 'onhandResourceGroup', value: 'operation' },
      ])
    }
  }

  private createSeedFunction () {
    const operationName = 'onhand-seed-function'
    const dynamoDBPolicy: Policy = { managedPolicy: 'AmazonDynamoDBFullAccess' }
    const s3Policy: Policy = { managedPolicy: 'AmazonS3FullAccess' }
    const policies: Policy[] = [dynamoDBPolicy, s3Policy]
    const functionName = resourceName(
      this.options,
      operationName,
      true,
      'kebab',
    )
    return this.createFunction(
      {
        operationName,
        functionName,
        description: 'function to apply seeds',
        policies,
        fileKey: `${this.project}-${
          this.options.packageVersion ?? ''
        }/${operationName}.zip`,
        handler: 'index.handler',
        version: this.options.packageVersion ?? '',
        isAuthorizer: false,
      },
      [
        { key: 'onhandProject', value: this.project },
        { key: 'onhandResource', value: 'function' },
        { key: 'onhandResourceGroup', value: 'pipeline' },
      ],
    )
  }

  private createFunction (
    functionOptions: FunctionOptions,
    tags: Array<{ key: string, value: string }>,
  ) {
    const lambdaRole = new iam.Role(
      this,
      _.camelCase(`func-${functionOptions.operationName}-role`),
      {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      },
    )
    lambdaRole.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN)
    const logPolicy: Policy = {
      inlinePolicy: {
        actions: ['logs:*'],
        effect: 'Allow',
        resources: [
          [
            'arn',
            'aws',
            'logs',
            this.region,
            this.account,
            'log-group',
            `/aws/lambda/${functionOptions.functionName}`,
            '*',
          ].join(':'),
        ],
      },
    }
    for (const policy of functionOptions.policies.concat([logPolicy])) {
      if ('managedPolicy' in policy) {
        lambdaRole.addManagedPolicy(
          iam.ManagedPolicy.fromAwsManagedPolicyName(policy.managedPolicy),
        )
      }
      if ('inlinePolicy' in policy) {
        lambdaRole.attachInlinePolicy(
          new iam.Policy(
            this,
            _.camelCase(
              `policy-${
                functionOptions.operationName
              }-${functionOptions.policies.indexOf(policy)}`,
            ),
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
    const func = new lambda.Function(
      this,
      _.camelCase(`func-${functionOptions.operationName}`),
      {
        handler: functionOptions.handler,
        runtime: lambda.Runtime.NODEJS_14_X,
        description: `${
          functionOptions.description ? functionOptions.description + ' - ' : ''
        }deployed on: ${new Date().toISOString()}`,
        functionName: functionOptions.functionName,
        code: lambda.Code.fromBucket(
          this.bucket!,
          functionOptions.fileKey,
          undefined,
        ),
        currentVersionOptions: {
          description: functionOptions.version,
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
      },
    )
    func.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN)
    for (const { key, value } of tags ?? []) {
      cdk.Tags.of(func).add(key, value)
    }
    const stageAlias = func.currentVersion.addAlias(this.options.stage)
    stageAlias.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN)
    if (this.options.packageVersion) {
      const alias = func.currentVersion.addAlias(
        this.options.packageVersion.replace(/\./g, '-'),
      )
      alias.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN)
    }

    return func
  }
}
