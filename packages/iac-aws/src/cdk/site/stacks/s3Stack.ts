/* eslint-disable no-new */
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

export class S3Stack extends cdk.Stack {
  private siteBucket!: s3.Bucket

  constructor (
    scope: cdk.Construct,
    private readonly options: Options,
    private readonly promote: boolean,
  ) {
    // TODO: add description to S3Stack
    super(scope, getS3StackName(options), {
      description: '',
      env: {
        account: options.awsAccount,
        region: options.awsRegion,
      },
    })

    if (!this.promote) {
      this.createReleaseBucket()
    }
    this.createSiteBucket()
    this.createOriginAccessIdentity()
  }

  private createReleaseBucket () {
    const bucketName = getReleasesBucketName(this.options)
    new s3.Bucket(this, bucketName, {
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      bucketName: bucketName,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      versioned: false,
    })
  }

  private createSiteBucket () {
    const bucketName = getAssetsBucketName(this.options)
    this.siteBucket = new s3.Bucket(this, bucketName, {
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      bucketName: bucketName,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
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
