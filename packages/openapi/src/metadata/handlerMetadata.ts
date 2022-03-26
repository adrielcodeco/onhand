import 'reflect-metadata'
import { manageMetadata } from '#/metadata/metadata'
import { FunctionMetadata } from '#/metadata/functionMetadata'

const symbolOnhandAPIHandlerMetadata = Symbol.for('onhand-api-handler-metadata')

export type HandlerMetadata = {
  functionFileAbsolutePath: string
  provider: string
  className: string
  handlerName: string
  functionMetadata: FunctionMetadata
  extra: any
}

export function manageHandlerMetadata<M extends HandlerMetadata> (target: any) {
  return manageMetadata<M>(target, symbolOnhandAPIHandlerMetadata)
}
