/* eslint-disable no-new */
import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'
import * as iam from '@aws-cdk/aws-iam'
import * as route53 from '@aws-cdk/aws-route53'
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import * as acm from '@aws-cdk/aws-certificatemanager'
import * as targets from '@aws-cdk/aws-route53-targets'
import { Container } from 'typedi'
import { Options, resourceName } from '#/app/options'
import {
  s3Arn,
  getCloudFormationStackName,
  getAssetsBucketName,
  getCFDistributionId,
  getCFDistributionName,
  getCFDistributionDN,
  getCFOriginAccessIdentity,
} from '#/cdk/resources'
import { InternalNestedStack } from '#/cdk/stack'

export class CloudFrontSiteStack extends InternalNestedStack {
  private distribution!: cloudfront.CloudFrontWebDistribution
  private readonly certificate?: acm.ICertificate
  private readonly domainAliases?: string[]
  private bucket!: s3.IBucket
  private originAccessIdentity!: cloudfront.OriginAccessIdentity

  constructor (scope: cdk.Construct, options: Options) {
    super(scope, options, getCloudFormationStackName(options))

    this.domainAliases =
      this.options.config?.cloudFront?.site?.domainAliases?.filter(a => !!a)

    const certificateArn = ` arn:aws:acm:us-east-1:${
      this.account
    }:certificate/${this.options.config?.cloudFront?.site?.certificateId ?? ''}`
    this.certificate = this.domainAliases?.length
      ? acm.Certificate.fromCertificateArn(
        this,
        resourceName(this.options, 'cert'),
        certificateArn,
      )
      : undefined
  }

  make () {
    this.getBucket()
    this.createSiteDistribution()
    this.addToBucketResourcePolicy()
    this.updateRoute53Records()
    return this
  }

  static init (scope: cdk.Construct): CloudFrontSiteStack {
    const options = Container.get<Options>('options')
    const instance = new CloudFrontSiteStack(scope, options)
    return instance.make()
  }

  private getBucket () {
    const bucketName = getAssetsBucketName(this.options)
    const s3AssetsArn = s3Arn(bucketName)
    this.bucket = s3.Bucket.fromBucketArn(this, bucketName, s3AssetsArn)
  }

  private createSiteDistribution () {
    if (!this.options.config?.cloudFront?.site) {
      return
    }
    this.createOriginAccessIdentity()
    const distName = getCFDistributionName(this.options)
    this.distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      distName,
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: this.bucket,
              originAccessIdentity: this.originAccessIdentity,
            },
            behaviors: [
              {
                compress: true,
                isDefaultBehavior: true,
                allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL,
                cachedMethods:
                  cloudfront.CloudFrontAllowedCachedMethods.GET_HEAD,
              },
            ],
          },
        ],
        errorConfigurations: [
          {
            errorCode: 403,
            responseCode: 200,
            responsePagePath: '/index.html',
            errorCachingMinTtl: 10,
          },
        ],
        defaultRootObject: 'index.html',
        enableIpV6: true,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        httpVersion: cloudfront.HttpVersion.HTTP2,
        ...(this.domainAliases?.length
          ? {
              viewerCertificate:
                cloudfront.ViewerCertificate.fromAcmCertificate(
                  this.certificate!,
                  {
                    securityPolicy:
                      cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
                    aliases: this.domainAliases,
                  },
                ),
            }
          : {}),
      },
    )

    const distributionIdExportName = getCFDistributionId(this.options)
    new cdk.CfnOutput(this, distributionIdExportName, {
      value: this.distribution.distributionId,
      exportName: distributionIdExportName,
    })

    const distributionDomainNameExportName = getCFDistributionDN(this.options)
    new cdk.CfnOutput(this, distributionDomainNameExportName, {
      value: this.distribution.distributionDomainName,
      exportName: distributionDomainNameExportName,
    })
  }

  private createOriginAccessIdentity () {
    const cfOriginAccessIdentity = getCFOriginAccessIdentity(this.options)
    this.originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      cfOriginAccessIdentity,
      {},
    )
  }

  private addToBucketResourcePolicy () {
    this.bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [this.bucket.arnForObjects('*')],
        principals: [this.originAccessIdentity.grantPrincipal],
      }),
    )
  }

  private updateRoute53Records () {
    if (this.options.config?.cloudFront?.site?.zoneName) {
      const zone = route53.PublicHostedZone.fromLookup(
        this,
        resourceName(this.options, 'siteHz'),
        {
          domainName: this.options.config?.cloudFront?.site?.zoneName,
        },
      )
      for (const alias of this.domainAliases ?? []) {
        if (!alias) {
          continue
        }
        const index = this.domainAliases?.indexOf(alias)
        new route53.ARecord(
          this,
          resourceName(this.options, `siteDomainRecordAlias-${index}`),
          {
            zone: zone,
            recordName: alias,
            target: route53.RecordTarget.fromAlias(
              new targets.CloudFrontTarget(this.distribution),
            ),
            ttl: cdk.Duration.seconds(300),
          },
        )
      }
    }
  }
}
