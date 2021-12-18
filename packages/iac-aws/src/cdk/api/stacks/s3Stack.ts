/* eslint-disable no-new */
import _ from 'lodash'
import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'
import { Options } from '#/app/options'
import { getS3StackName, getReleasesBucketName } from '#/cdk/resources'
import { InternalStack } from '#/cdk/stack'
import Container from 'typedi'

export class S3Stack extends InternalStack {
  constructor (scope: cdk.Construct, options: Options) {
    // TODO: add description to cognito stack
    super(scope, options, getS3StackName(options))
  }

  make () {
    this.createBucket()
    return this
  }

  static init (scope: cdk.Construct): S3Stack {
    const options = Container.get<Options>('options')
    const instance = new S3Stack(scope, options)
    return instance.make()
  }

  private createBucket () {
    const bucketName = getReleasesBucketName(this.options)
    new s3.Bucket(this, _.camelCase(bucketName), {
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      bucketName: bucketName,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      versioned: false,
    })
  }
}
