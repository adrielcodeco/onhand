import { OpenAPIV3 } from 'openapi-types'
import { OpenAPIClass } from '#/interfaces/openAPIClass'
import { manageDocumentMetadata } from '#/documentMetadata'

type Constructor<T> = { new (...args: any[]): T }

export function OpenAPI (paths: string, options?: Partial<OpenAPIClass>) {
  return (constructor: Constructor<any>) => {
    const openApi = { openapi: '3.0.3' }
    try {
      const instance = Reflect.construct(constructor, [])
      if (instance) {
        Object.assign(openApi, instance)
      }
    } finally {
      // does nothing
    }
    if (options) {
      Object.assign(openApi, options)
    }

    manageDocumentMetadata(constructor)
      .set(openApi as OpenAPIV3.Document)
      .setPathsDir(paths)

    return constructor
  }
}
