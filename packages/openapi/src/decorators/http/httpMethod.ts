import { HttpMethods } from '#/httpMethods'
import { Path } from '#/decorators/path'

type Constructor<T> = { new (...args: any[]): T }

export function HttpMethod (path: string, method: HttpMethods) {
  return (constructor: Constructor<any>) => {
    const pathItem: {
      summary?: string
      description?: string
      operationId?: string
      deprecated?: string
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
