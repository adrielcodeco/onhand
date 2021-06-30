import { manageHttpMetadata } from '#/httpMetadata'

/**
 * HTTP 100 - Continue
 * An interim response. Indicates the client that the initial part
 * of the request has been received and has not yet been
 * rejected by the server. The client SHOULD continue by
 * sending the remainder of the request or, if the request has
 * already been completed, ignore this response. The server
 * MUST send a final response after the request has been completed.
 */
export function http100 () {
  const response = {}
  return manageHttpMetadata(response).set({ statusCode: 100 }).end()
}
export const Continue = http100
