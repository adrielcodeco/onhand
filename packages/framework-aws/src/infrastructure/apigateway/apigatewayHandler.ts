import 'reflect-metadata'
import { manageFunctionMetadata, manageHandlerMetadata } from '@onhand/openapi'
import { ApiGatewayFunction } from '#/infrastructure/apigateway/apigatewayFunction'
import { session } from '@onhand/framework/#/services/sessionService'
import { container } from '@onhand/business/#/ioc/container'
import { Ctor } from '@onhand/utils'

export function apiGatewayHandler (
  FunctionClass: Ctor<ApiGatewayFunction>,
): (event: any, context: any) => any {
  const lambda = container.resolve(FunctionClass)
  const containerContext = lambda.init()
  const handler = async (event: any, context: any) => {
    return new Promise((resolve, reject) => {
      session.run(() => {
        (async () => {
          await containerContext
          return lambda.handle(event, context)
        })()
          .then(resolve)
          .catch(reject)
      })
    })
  }
  handler.isHandler = true
  handler.isFunction = true
  const operationMetadata = manageFunctionMetadata(FunctionClass).get()
  return manageHandlerMetadata(handler)
    .merge({
      className: FunctionClass.name,
      provider: 'AWS',
      functionMetadata: operationMetadata,
    })
    .end()
}
