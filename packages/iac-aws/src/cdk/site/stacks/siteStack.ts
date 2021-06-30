/* eslint-disable no-new */
import * as cdk from '@aws-cdk/core'
import { Options } from '#/app/options'
import { CloudFrontSiteStack } from './cloudfrontStack'
import { DeployStack } from './deployStack'
import { getMainStackName, projectName } from '#/cdk/resources'

export class SiteStack extends cdk.Stack {
  private readonly project: string

  constructor (scope: cdk.Construct, private readonly options: Options) {
    // TODO: add description to SiteStack
    super(scope, getMainStackName(options), {
      description: '',
      env: {
        account: options.awsAccount,
        region: options.awsRegion,
      },
    })
    this.project = projectName(this.options)
    this.tags.setTag('onhand', 'site')
    this.tags.setTag('onhandProject', this.project)

    // CloudFront
    const cloudfront = new CloudFrontSiteStack(this, this.options)

    // Deploy
    const deploy = new DeployStack(this, this.options)
    deploy.addDependency(cloudfront)
  }
}
