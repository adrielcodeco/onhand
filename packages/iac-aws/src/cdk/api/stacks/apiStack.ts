/* eslint-disable no-new */
import * as cdk from '@aws-cdk/core'

import { Options } from '#/app/options'
import { FunctionsStack } from './functionsStack'
import { ApiGatewayStack } from './apigatewayStack'
import { DeployStack } from './deployStack'
import { getMainStackName } from '#/cdk/resources'
import { InternalStack } from '#/cdk/stack'

export class ApiStack extends InternalStack {
  constructor (scope: cdk.Construct, options: Options) {
    // TODO: add description to cognito stack
    super(scope, options, getMainStackName(options))
    this.tags.setTag('onhand', 'api')
    this.tags.setTag('onhandProject', this.stackTools.project)

    let functions
    if (!this.stackTools.promote) {
      // Functions
      functions = new FunctionsStack(this, this.options)
    }

    // ApiGateway
    const apiGateway = new ApiGatewayStack(this, this.options)
    if (functions) {
      apiGateway.addDependency(functions)
    }

    // Deploy
    const deploy = new DeployStack(this, this.options)
    deploy.addDependency(apiGateway)
  }
}
