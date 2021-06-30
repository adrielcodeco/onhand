import { FailResponse } from '#/types'
import { manageHttpMetadata } from '#/httpMetadata'

/**
 * HTTP 403 - Forbidden
 * The 403 status code is usually sent out in response to a GET, POST, PUT OR DELETE request.
 */
export function http403<T> (data: T | undefined = undefined): FailResponse<T> {
  const response: FailResponse<T> = {
    status: 'fail',
    data,
  }
  return manageHttpMetadata(response).set({ statusCode: 403 }).end()
}
export const Forbidden = http403
