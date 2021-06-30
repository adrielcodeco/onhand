import { SuccessResponse } from '#/types'
import { manageHttpMetadata } from '#/httpMetadata'

/**
 * HTTP 202 - Accepted
 * The 202 status code is usually sent out in response to a POST OR PUT request.
 */
export function http202<T> (): SuccessResponse<T> {
  const response: SuccessResponse<T> = {
    status: 'success',
    data: undefined,
  }
  return manageHttpMetadata(response).set({ statusCode: 202 }).end()
}
export const Accepted = http202
