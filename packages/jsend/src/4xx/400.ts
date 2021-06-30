import { FailResponse } from '#/types'
import { manageHttpMetadata } from '#/httpMetadata'

/**
 * HTTP 400 - Bad Request
 * The 400 status code is usually sent out in response to a GET, POST, PUT OR DELETE request.
 */
export function http400<T> (data: T | undefined = undefined): FailResponse<T> {
  const response: FailResponse<T> = {
    status: 'fail',
    data,
  }
  return manageHttpMetadata(response).set({ statusCode: 400 }).end()
}
export const BadRequest = http400
