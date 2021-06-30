import { HttpMethods } from '#/httpMethods'
import { HttpMethod } from '#/decorators/http/httpMethod'

export function HttpPost (path: string) {
  return HttpMethod(path, HttpMethods.post)
}
