import 'reflect-metadata'
import { OpenAPIV3 } from 'openapi-types'
import { manageMetadata } from '@onhand/utils'

const symbolOnhandAPIFunctionMetadata = Symbol.for(
  'onhand-api-function-metadata',
)

export type FunctionMetadata<T = any> = {
  path: string
  method: string
  operation: OpenAPIV3.OperationObject
  extra: T
}

export function manageFunctionMetadata<M extends FunctionMetadata, T = any> (
  target: T,
) {
  return manageMetadata<M, T>(target, symbolOnhandAPIFunctionMetadata)
}
