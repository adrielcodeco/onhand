import { HttpMethods } from '#/httpMethods'
import { HttpMethod } from '#/decorators/http/httpMethod'

export function HttpPatch (path: string) {
  return HttpMethod(path, HttpMethods.patch)
}
