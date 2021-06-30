import { FailResponse } from '#/types'
import { manageHttpMetadata } from '#/httpMetadata'

/**
 * HTTP 412 - Precondition Failed
 * The 412 status code is usually sent out in response to a GET, POST, PUT OR DELETE request.
 */
export function http412<T> (data: T | undefined = undefined): FailResponse<T> {
  const response: FailResponse<T> = {
    status: 'fail',
    data,
  }
  return manageHttpMetadata(response).set({ statusCode: 412 }).end()
}
export const PreconditionFailed = http412
