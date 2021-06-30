import 'reflect-metadata'
import { ApiGatewayFunction } from '#/infrastructure/apigateway/apigatewayFunction'
import { session } from '@onhand/framework/#/services/sessionService'
import { container } from '@onhand/business/#/ioc/container'
import { Ctor, as } from '@onhand/utils'

const symbolOnhandHandlerMetadata = Symbol.for('onhand-handler-metadata')

type FunctionClassType = Ctor<ApiGatewayFunction>

export function apiGatewayHandler (
  FunctionClass: FunctionClassType,
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
  const handlerMetadata = {
    provider: 'AWS',
    className: FunctionClass.name,
  }
  Reflect.defineMetadata(symbolOnhandHandlerMetadata, handlerMetadata, handler)
  as(FunctionClass).isFunction = true
  handler.isHandler = true
  return handler
}
