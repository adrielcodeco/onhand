/* eslint-disable no-new */
import _ from 'lodash'
import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'
import { Options } from '#/app/options'
import { getS3StackName, getReleasesBucketName } from '#/cdk/resources'

export class S3Stack extends cdk.Stack {
  constructor (scope: cdk.Construct, private readonly options: Options) {
    // TODO: add description to cognito stack
    super(scope, getS3StackName(options), {
      description: '',
      env: {
        account: options.awsAccount,
        region: options.awsRegion,
      },
    })

    this.createBucket()
  }

  private createBucket () {
    const bucketName = getReleasesBucketName(this.options)
    new s3.Bucket(this, _.camelCase(bucketName), {
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      bucketName: bucketName,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      versioned: false,
    })
  }
}
