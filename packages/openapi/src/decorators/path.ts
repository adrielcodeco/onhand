import { OpenAPIV3 } from 'openapi-types'
import { HttpMethods } from '#/httpMethods'
import { manageFunctionMetadata } from '#/metadata'
import { Ctor } from '@onhand/utils'

export function Path (
  path: string,
  method: HttpMethods,
  summary?: string,
  description?: string,
  operationId?: string,
  deprecated?: boolean,
) {
  return (constructor: Ctor<any>) => {
    const operation: Partial<OpenAPIV3.OperationObject> = {}
    if (summary) {
      operation.summary = summary
    }
    if (description) {
      operation.description = description
    }
    if (operationId) {
      operation.operationId = operationId
    }
    if (deprecated) {
      operation.deprecated = deprecated
    }
    return manageFunctionMetadata(constructor)
      .merge({
        path,
        method: HttpMethods[method],
        operation,
      })
      .end()
  }
}
