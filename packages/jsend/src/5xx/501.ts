import { ErrorResponse } from '#/types'
import { manageHttpMetadata } from '#/httpMetadata'

/**
 * HTTP 501 - Not Implemented
 * The 501 status code is usually sent out in response to a GET, POST, PUT OR DELETE request.
 */
export function http501<T> (
  data?: any,
  message = 'Not Implemented',
): ErrorResponse<T> {
  const response: ErrorResponse<T> = {
    status: 'error',
    message,
    data,
  }
  return manageHttpMetadata(response).set({ statusCode: 501 }).end()
}
export const NotImplemented = http501
