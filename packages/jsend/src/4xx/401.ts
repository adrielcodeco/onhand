import { FailResponse } from '#/types'
import { manageHttpMetadata } from '#/httpMetadata'

/**
 * HTTP 401 - Unauthorized
 * The 401 status code is usually sent out in response to a GET, POST, PUT OR DELETE request.
 */
export function http401<T = any> (
  data: T | undefined = { Authorization: 'Unauthorized' } as any,
): FailResponse<T> {
  const response: FailResponse<T> = {
    status: 'fail',
    data: data,
  }
  return manageHttpMetadata(response).set({ statusCode: 401 }).end()
}
export const Unauthorized = http401
