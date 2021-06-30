import { ErrorResponse } from '#/types'
import { manageHttpMetadata } from '#/httpMetadata'

/**
 * HTTP 500 - Internal Server Error
 * The 500 status code is usually sent out in response to a GET, POST, PUT OR DELETE request.
 */
export function http500<T> (
  data?: any,
  message = 'Something is broken',
  code?: string,
): ErrorResponse<T> {
  const response: ErrorResponse<T> = {
    status: 'error',
    message,
    data,
  }
  return manageHttpMetadata(response).set({ statusCode: 500 }).end()
}
export const InternalServerError = http500
