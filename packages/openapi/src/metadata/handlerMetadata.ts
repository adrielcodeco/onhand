import 'reflect-metadata'
import { manageMetadata } from '@onhand/utils'
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

export function manageHandlerMetadata<M extends HandlerMetadata, T = any> (
  target: T,
) {
  return manageMetadata<M, T>(target, symbolOnhandAPIHandlerMetadata)
}
