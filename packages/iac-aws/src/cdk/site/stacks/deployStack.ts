/* eslint-disable no-new */
import { Container } from 'typedi'
import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import * as s3Deployment from '@aws-cdk/aws-s3-deployment'
import { getConfigOrDefault } from '#/app/config'
import { Options } from '#/app/options'
import {
  s3Arn,
  projectName,
  getDeployStackName,
  getAssetsBucketName,
  getReleasesBucketName,
  getCFDistributionName,
  getCFDistributionId,
  getCFDistributionDN,
  getSiteDeployment,
} from '#/cdk/resources'

export class DeployStack extends cdk.NestedStack {
  constructor (scope: cdk.Construct, private readonly options: Options) {
    super(scope, getDeployStackName(options))
  }

  make () {
    this.deployment()
    return this
  }

  static init (scope: cdk.Construct): DeployStack {
    const options = Container.get<Options>('options')
    const instance = new DeployStack(scope, options)
    return instance.make()
  }

  private deployment () {
    const originBucketName = getReleasesBucketName(this.options)
    const originS3AssetsArn = s3Arn(originBucketName)
    const originBucket = s3.Bucket.fromBucketArn(
      this,
      originBucketName,
      originS3AssetsArn,
    )

    const targetBucketName = getAssetsBucketName(this.options)
    const targetS3AssetsArn = s3Arn(targetBucketName)
    const targetBucket = s3.Bucket.fromBucketArn(
      this,
      targetBucketName,
      targetS3AssetsArn,
    )

    const distributionIdExportName = getCFDistributionId(this.options)
    const distributionDomainNameExportName = getCFDistributionDN(this.options)
    const distribution =
      cloudfront.CloudFrontWebDistribution.fromDistributionAttributes(
        this,
        getCFDistributionName(this.options),
        {
          distributionId: cdk.Fn.importValue(distributionIdExportName),
          domainName: cdk.Fn.importValue(distributionDomainNameExportName),
        },
      )

    const packageName = getConfigOrDefault(
      this.options.config,
      c => c.package?.name,
    )!
    const bundle = `${projectName(this.options)}-${
      this.options.packageVersion ?? ''
    }/${packageName}.zip`

    new s3Deployment.BucketDeployment(this, getSiteDeployment(this.options), {
      sources: [s3Deployment.Source.bucket(originBucket, bundle)],
      destinationBucket: targetBucket,
      distribution: distribution,
      retainOnDelete: false,
    })
  }
}
