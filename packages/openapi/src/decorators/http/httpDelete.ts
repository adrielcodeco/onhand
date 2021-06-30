import { HttpMethods } from '#/httpMethods'
import { HttpMethod } from '#/decorators/http/httpMethod'

export function HttpDelete (path: string) {
  return HttpMethod(path, HttpMethods.delete)
}
