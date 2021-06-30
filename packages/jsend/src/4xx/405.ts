import { ErrorResponse } from '#/types'
import { HttpMethods } from '#/httpMethods'
import { manageHttpMetadata } from '#/httpMetadata'

/**
 * HTTP 405 - Method Not Allowed
 * The API responds with a 405 error to indicate that the client tried to use an HTTP
 * method that the resource does not allow. For instance, a read-only resource could
 * support only GET and HEAD, while a controller resource might allow GET and POST,
 * but not PUT or DELETE.
 */
export function http405<T> (allow: HttpMethods[]): ErrorResponse<T> {
  const response: ErrorResponse<T> = {
    status: 'error',
    message: `Allow: ${allow.join(',')}`,
  }
  return manageHttpMetadata(response).set({ statusCode: 405 }).end()
}
export const MethodNotAllowed = http405
