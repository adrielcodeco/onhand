import { HttpMethods } from '#/httpMethods'
import { HttpMethod } from '#/decorators/http/httpMethod'

export function HttpPut (path: string) {
  return HttpMethod(path, HttpMethods.put)
}
