/* eslint-disable no-new */
import _ from 'lodash'
import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'
import { Container } from 'typedi'
import { Options } from '#/app/options'
import {
  getS3StackName,
  getReleasesBucketName,
  getAssetsBucketName,
} from '#/cdk/resources'
import { InternalStack } from '#/cdk/stack'

export class S3Stack extends InternalStack {
  constructor (scope: cdk.Construct, options: Options) {
    // TODO: add description to S3Stack
    super(scope, options, getS3StackName(options))
  }

  make () {
    if (!this.stackTools.promote) {
      this.createReleaseBucket()
    }
    this.createSiteBucket()
    return this
  }

  static init (scope: cdk.Construct): S3Stack {
    const options = Container.get<Options>('options')
    const instance = new S3Stack(scope, options)
    return instance.make()
  }

  private createReleaseBucket () {
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

  private createSiteBucket () {
    const bucketName = getAssetsBucketName(this.options)
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
