import { FailResponse } from '#/types'
import { manageHttpMetadata } from '#/httpMetadata'

/**
 * HTTP 422 - Unprocessable Entity
 * The server understands the content type and syntax of the request entity, but still
 * server is unable to process the request for some reason.
 */
export function http422<T> (data?: T): FailResponse<T>
export function http422 (message?: string): FailResponse<string | undefined>
export function http422<T> (
  dataOrMessage: T | string | undefined = undefined,
): FailResponse<T | string | undefined> {
  const response: FailResponse<T | string | undefined> = {
    status: 'fail',
    data: dataOrMessage,
  }
  return manageHttpMetadata(response).set({ statusCode: 422 }).end()
}
export const UnprocessableEntity = http422
