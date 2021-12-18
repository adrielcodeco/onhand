/* eslint-disable no-new */
import * as cdk from '@aws-cdk/core'
import { Options } from '#/app/options'
import { FunctionsStack } from './functionsStack'
import { ApiGatewayStack } from './apigatewayStack'
import { DeployStack } from './deployStack'
import { getMainStackName } from '#/cdk/resources'
import { InternalStack } from '#/cdk/stack'
import Container from 'typedi'

export class ApiStack extends InternalStack {
  constructor (scope: cdk.Construct, options: Options) {
    // TODO: add description to cognito stack
    super(scope, options, getMainStackName(options))
    this.tags.setTag('onhand', 'api')
    this.tags.setTag('onhandProject', this.stackTools.project)
  }

  make () {
    // Functions
    const functions = FunctionsStack.init(this)

    // ApiGateway
    const apiGateway = ApiGatewayStack.init(this)
    if (functions) {
      apiGateway.addDependency(functions)
    }

    // Deploy
    const deploy = DeployStack.init(this)
    deploy.addDependency(apiGateway)

    return this
  }

  static init (scope: cdk.Construct): ApiStack {
    const options = Container.get<Options>('options')
    const instance = new ApiStack(scope, options)
    return instance.make()
  }
}
