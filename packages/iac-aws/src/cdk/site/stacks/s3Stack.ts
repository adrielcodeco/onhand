/* eslint-disable no-new */
import _ from 'lodash'
import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'
import * as iam from '@aws-cdk/aws-iam'
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import { Container } from 'typedi'
import { Options } from '#/app/options'
import {
  getS3StackName,
  getReleasesBucketName,
  getAssetsBucketName,
  getCFOriginAccessIdentity,
} from '#/cdk/resources'
import { InternalStack } from '#/cdk/stack'

export class S3Stack extends InternalStack {
  private siteBucket!: s3.Bucket

  constructor (scope: cdk.Construct, options: Options) {
    // TODO: add description to S3Stack
    super(scope, options, getS3StackName(options))
  }

  make () {
    if (!this.stackTools.promote) {
      this.createReleaseBucket()
    }
    this.createSiteBucket()
    this.createOriginAccessIdentity()
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
    this.siteBucket = new s3.Bucket(this, _.camelCase(bucketName), {
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      bucketName: bucketName,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      versioned: false,
    })
  }

  private createOriginAccessIdentity () {
    const cfOriginAccessIdentity = getCFOriginAccessIdentity(this.options)
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      cfOriginAccessIdentity,
      {},
    )
    this.siteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [this.siteBucket.arnForObjects('*')],
        principals: [originAccessIdentity.grantPrincipal],
      }),
    )
    Container.set(
      cfOriginAccessIdentity,
      originAccessIdentity.originAccessIdentityName,
    )
  }
}
