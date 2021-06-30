/* eslint-disable no-new */
import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as logs from '@aws-cdk/aws-logs'
import * as cr from '@aws-cdk/custom-resources'
import { Options, resourceName } from '#/app/options'

export function customResource (
  scope: cdk.Stack,
  operationName: string,
  func: lambda.IFunction,
  options: Options,
  props?: any,
) {
  const funcProvider = new cr.Provider(
    scope,
    resourceName(options, operationName + '-provider'),
    {
      onEventHandler: func,
      logRetention: logs.RetentionDays.ONE_DAY,
    },
  )

  const resource = new cdk.CustomResource(
    scope,
    resourceName(options, operationName + '-resource'),
    {
      serviceToken: funcProvider.serviceToken,
      properties: props,
    },
  )

  funcProvider.node.addDependency(func)
  resource.node.addDependency(func)

  return resource
}

export function functionFromName (
  scope: cdk.Stack,
  operationName: string,
  options: Options,
  alias = '',
) {
  const functionName = resourceName(options, operationName, true)
  return lambda.Function.fromFunctionArn(
    scope,
    `func-${operationName}-fromArn`,
    `arn:aws:lambda:${scope.region}:${scope.account}:function:${functionName}${
      alias ? ':' : ''
    }${alias}`,
  )
}
