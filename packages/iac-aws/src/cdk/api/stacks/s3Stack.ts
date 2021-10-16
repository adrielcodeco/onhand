/* eslint-disable no-new */
import _ from 'lodash'
import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'
import { Options } from '#/app/options'
import { getS3StackName, getReleasesBucketName } from '#/cdk/resources'
import { InternalStack } from '#/cdk/stack'

export class S3Stack extends InternalStack {
  constructor (scope: cdk.Construct, options: Options) {
    // TODO: add description to cognito stack
    super(scope, options, getS3StackName(options))

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
