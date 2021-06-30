/* eslint-disable no-new */
import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'
import * as iam from '@aws-cdk/aws-iam'
import * as logs from '@aws-cdk/aws-logs'
import * as lambda from '@aws-cdk/aws-lambda'
import * as cr from '@aws-cdk/custom-resources'
import { Options, resourceName } from '#/app/options'

export class SourceVersioningStack extends cdk.NestedStack {
  private readonly provider!: cr.Provider

  constructor (
    scope: cdk.Construct,
    private readonly options: Options,
    name: string,
  ) {
    super(scope, resourceName(options, `s3-upload-${name}`))

    const bucketName = resourceName(this.options, 's3-api', true)
    const s3AssetsArn = `arn:aws:s3:::${bucketName}`
    const bucket = s3.Bucket.fromBucketArn(this, bucketName, s3AssetsArn)
    const functionName = 'onhand-sourceVersioning-function'
    const func = new lambda.Function(this, `func-${functionName}`, {
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      description: `seeds the database - deployed on: ${new Date().toISOString()}`,
      functionName: resourceName(this.options, functionName, true),
      code: lambda.Code.fromBucket(
        bucket,
        `${this.options.packageName ?? ''}-${
          this.options.packageVersion ?? ''
        }/${functionName}.zip`,
        undefined,
      ),
      currentVersionOptions: {
        description: this.options.packageVersion,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        retryAttempts: 1,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      memorySize: 256,
      reservedConcurrentExecutions: undefined,
      timeout: cdk.Duration.minutes(15),
      initialPolicy: [
        new iam.PolicyStatement({
          resources: ['*'],
          actions: [
            's3:GetObject*',
            's3:GetBucket*',
            's3:List*',
            's3:DeleteObject*',
            's3:PutObject*',
            's3:Abort*',
          ],
        }),
      ],
    })
    this.provider = new cr.Provider(
      this,
      resourceName(options, `s3-upload-${name}-provider`),
      {
        onEventHandler: func,
        logRetention: logs.RetentionDays.ONE_DAY,
      },
    )
  }

  public versioning (to: string) {
    const bucketName = resourceName(this.options, 's3-api', true)
    return new cdk.CustomResource(
      this,
      resourceName(this.options, `${bucketName}/${to}`),
      {
        serviceToken: this.provider.serviceToken,
        resourceType: 'Custom::S3Upload',
        properties: {
          bucketName: bucketName,
          prefix: to,
        },
      },
    )
  }
}
