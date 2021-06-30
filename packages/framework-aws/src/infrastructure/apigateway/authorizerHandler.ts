import 'reflect-metadata'
import { IAuthorizerFunction } from '#/infrastructure/apigateway/iAuthorizerFunction'

const symbolOnhandAuthorizerMetadata = Symbol.for('onhand-authorizer-metadata')

type FunctionClassType = {
  new (...args: any[]): IAuthorizerFunction
}

export function authorizerHandler (
  FunctionClass: FunctionClassType,
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
  const handlerMetadata = {
    provider: 'AWS',
    className: FunctionClass.name,
    openapi: {
      type: 'http',
      scheme: 'bearer',
    },
  }
  Reflect.defineMetadata(
    symbolOnhandAuthorizerMetadata,
    handlerMetadata,
    handler,
  )
  return handler
}
