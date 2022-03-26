import { OpenAPIV3 } from 'openapi-types'
import { OpenAPIClass } from '#/interfaces/openAPIClass'
import { manageDocumentMetadata } from '#/metadata'
import { Ctor } from '@onhand/utils'

export function OpenAPI (paths: string, options?: Partial<OpenAPIClass>) {
  return (constructor: Ctor<any>) => {
    const openApi: Partial<OpenAPIV3.Document> = { openapi: '3.0.3' }
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

    return manageDocumentMetadata(constructor)
      .merge({
        documentFileAbsolutePath: paths,
        openApi,
        handlersDirectoryPath: paths,
        extra: {},
      })
      .end()
  }
}
