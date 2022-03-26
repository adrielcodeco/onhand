import { HttpMethods } from '#/httpMethods'
import { Path } from '#/decorators/path'
import { Ctor } from '@onhand/utils'

export function HttpMethod (path: string, method: HttpMethods) {
  return (constructor: Ctor<any>) => {
    const pathItem: {
      summary?: string
      description?: string
      operationId?: string
      deprecated?: boolean
    } = {}
    try {
      const instance = Reflect.construct(constructor, [])
      pathItem.summary = instance.summary
      pathItem.description = instance.description
      pathItem.operationId = instance.operationId ?? constructor.name
      pathItem.deprecated = instance.deprecated
    } finally {
      // does nothing
    }
    return Path(
      path,
      method,
      pathItem.summary,
      pathItem.description,
      pathItem.operationId,
      pathItem.deprecated,
    )(constructor)
  }
}
