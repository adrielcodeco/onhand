import { HttpMethods } from '#/httpMethods'
import { HttpMethod } from '#/decorators/http/httpMethod'

export function HttpGet (path: string) {
  return HttpMethod(path, HttpMethods.get)
}
