/* eslint-disable no-new */
import * as cdk from '@aws-cdk/core'
import { Options } from '#/app/options'
import { CloudFrontSiteStack } from './cloudfrontStack'
import { DeployStack } from './deployStack'
import { InternalStack } from '#/cdk/stack'
import { getMainStackName } from '#/cdk/resources'
import Container from 'typedi'

export class SiteStack extends InternalStack {
  constructor (scope: cdk.Construct, options: Options) {
    // TODO: add description to SiteStack
    super(scope, options, getMainStackName(options))
    this.tags.setTag('onhand', 'api')
    this.tags.setTag('onhandProject', this.stackTools.project)
  }

  make () {
    // CloudFront
    const cloudfront = CloudFrontSiteStack.init(this)

    // Deploy
    const deploy = DeployStack.init(this)
    deploy.addDependency(cloudfront)

    return this
  }

  static init (scope: cdk.Construct): SiteStack {
    const options = Container.get<Options>('options')
    const instance = new SiteStack(scope, options)
    return instance.make()
  }
}
