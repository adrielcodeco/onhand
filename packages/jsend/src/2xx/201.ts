import { SuccessResponse } from '#/types'
import { manageHttpMetadata } from '#/httpMetadata'

/**
 * HTTP 201 - Created
 * The 201 status code is usually sent out in response to a POST request.
 */
export function http201<T> (
  data: T | undefined = undefined,
): SuccessResponse<T> {
  const response: SuccessResponse<T> = {
    status: 'success',
    data,
  }
  return manageHttpMetadata(response).set({ statusCode: 201 }).end()
}
export const Created = http201
