import 'reflect-metadata'
import { OpenAPIV3 } from 'openapi-types'
import { manageMetadata } from '#/metadata/metadata'

const symbolOnhandAPIFunctionMetadata = Symbol.for(
  'onhand-api-function-metadata',
)

export type FunctionMetadata = {
  path: string
  method: string
  operation: OpenAPIV3.OperationObject
  extra: any
}

export function manageFunctionMetadata<M extends FunctionMetadata> (
  target: any,
) {
  return manageMetadata<M>(target, symbolOnhandAPIFunctionMetadata)
}
