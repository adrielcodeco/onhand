import { manageHttpMetadata } from '#/httpMetadata'

/**
 * HTTP 204 - No Content
 * The 204 status code is usually sent out in response to a GET, POST, PUT OR DELETE request.
 */
export function http204 () {
  const response = {}
  return manageHttpMetadata(response).set({ statusCode: 204 }).end()
}
export const NoContent = http204
