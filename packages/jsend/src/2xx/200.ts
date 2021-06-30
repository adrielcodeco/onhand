import { SuccessResponse } from '#/types'
import { manageHttpMetadata } from '#/httpMetadata'

/**
 * HTTP 200 - OK
 * The 200 status code is usually sent out in response to a GET request.
 */
export function http200<T> (data: T): SuccessResponse<T> {
  const response: SuccessResponse<T> = {
    status: 'success',
    data,
  }
  return manageHttpMetadata(response).set({ statusCode: 200 }).end()
}
export const OK = http200
