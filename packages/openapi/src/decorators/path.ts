import { OpenAPIV3 } from 'openapi-types'
import { HttpMethods } from '#/httpMethods'
import { managePathMetadata } from '#/pathMetadata'

type Constructor<T> = { new (...args: any[]): T }

export function Path (
  path: string,
  method: HttpMethods,
  summary?: string,
  description?: string,
  operationId?: string,
  deprecated?: string,
) {
  return (constructor: Constructor<any>) => {
    const pathMetadata: OpenAPIV3.PathsObject = {
      [path]: {
        [HttpMethods[method]]: {
          summary,
          description,
          operationId,
          deprecated,
        },
      },
    }
    managePathMetadata(constructor)
      .set(pathMetadata)
      .setMethod(method)
      .setPath(path)
    return constructor
  }
}
