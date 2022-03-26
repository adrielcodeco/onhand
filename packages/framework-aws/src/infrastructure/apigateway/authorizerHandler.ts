import 'reflect-metadata'
import { manageFunctionMetadata, manageHandlerMetadata } from '@onhand/openapi'
import { IAuthorizerFunction } from '#/infrastructure/apigateway/iAuthorizerFunction'
import { Ctor } from '@onhand/utils'

export function authorizerHandler (
  FunctionClass: Ctor<IAuthorizerFunction>,
  authorizerName = 'default',
): (
    event: any,
    context: any,
    handlerCallback: (a: string | null, b?: any) => void,
  ) => any {
  const lambda = new FunctionClass()
  const containerContext = lambda.init()
  const handler = async (
    event: any,
    context: any,
    handlerCallback: (a: string | null, b?: any) => void,
  ) => {
    await containerContext
    return lambda.handle(event, context, handlerCallback)
  }
  const operationMetadata = manageFunctionMetadata(FunctionClass).get()
  handler.isHandler = true
  handler.isAuthorizer = true
  return manageHandlerMetadata(handler)
    .merge({
      className: FunctionClass.name,
      provider: 'AWS',
      functionMetadata: operationMetadata,
      extra: {
        authorizerName,
      },
    })
    .end()
}
