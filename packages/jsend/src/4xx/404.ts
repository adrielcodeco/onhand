import { FailResponse } from '#/types'
import { manageHttpMetadata } from '#/httpMetadata'

/**
 * HTTP 404 - Not Found
 * The 404 error status code indicates that the REST API can’t map the
 * client’s URI to a resource but may be available in the future. Subsequent
 * requests by the client are permissible.
 * No indication is given of whether the condition is temporary or permanent.
 * The 410 (Gone) status code SHOULD be used if the server knows, through some
 * internally configurable mechanism, that an old resource is permanently
 * unavailable and has no forwarding address. This status code is commonly
 * used when the server does not wish to reveal exactly why the request has been
 * refused, or when no other response is applicable.
 */
export function http404<T> (data: T | undefined = undefined): FailResponse<T> {
  const response: FailResponse<T> = {
    status: 'fail',
    data,
  }
  return manageHttpMetadata(response).set({ statusCode: 404 }).end()
}
export const NotFound = http404
