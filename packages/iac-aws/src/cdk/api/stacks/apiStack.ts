/* eslint-disable no-new */
import * as cdk from '@aws-cdk/core'
import { Options } from '#/app/options'
import { FunctionsStack } from './functionsStack'
import { ApiGatewayStack } from './apigatewayStack'
import { DeployStack } from './deployStack'
import { getMainStackName, projectName } from '#/cdk/resources'

export class ApiStack extends cdk.Stack {
  private readonly project: string

  constructor (
    scope: cdk.Construct,
    private readonly options: Options,
    private readonly promote: boolean,
  ) {
    // TODO: add description to cognito stack
    super(scope, getMainStackName(options), {
      description: '',
      env: {
        account: options.awsAccount,
        region: options.awsRegion,
      },
    })
    this.project = projectName(this.options)
    this.tags.setTag('onhand', 'api')
    this.tags.setTag('onhandProject', this.project)

    let functions
    if (!this.promote) {
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
