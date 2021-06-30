import { manageHttpMetadata } from '#/httpMetadata'

/**
 * HTTP 301 - Moved Permanently
 * The 301 status code indicates that the REST API’s resource model has been
 * significantly redesigned, and a new permanent URI has been assigned to the client’s
 * requested resource. The REST API should specify the new URI in the response’s
 * Location header, and all future requests should be directed to the given URI.
 * You will hardly use this response code in your API as you can always use the API
 * versioning for new API while retaining the old one.
 */
export function http301 () {
  const response = {}
  return manageHttpMetadata(response).set({ statusCode: 301 }).end()
}
export const MovedPermanently = http301
