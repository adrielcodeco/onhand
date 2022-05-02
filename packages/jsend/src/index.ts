/**
 * https://restfulapi.net/http-status-codes/
 * https://www.restapitutorial.com/httpstatuscodes.html
 */
import { http200, http201, http202, http204 } from './2xx'
import { http404, http412, http422 } from './4xx'
import { http500 } from './5xx'

export * from './2xx'
export * from './4xx'
export * from './5xx'
export * from './types'
export * from './setCookie'

export const httpGuide = {
  get: {
    success: http200,
    fail: {
      itemNotFound: http404,
      forValidation: http412,
      unprocessableEntity: http422,
    },
    error: http500,
  },
  post: {
    success: {
      empty: http202,
      withData: http201,
    },
    fail: {
      itemNotFound: http404,
      forValidation: http412,
      unprocessableEntity: http422,
    },
    error: http500,
  },
  put: {
    success: {
      empty: http202,
      withData: http201,
    },
    fail: {
      itemNotFound: http404,
      forValidation: http412,
      unprocessableEntity: http422,
    },
    error: http500,
  },
  delete: {
    success: http204,
    fail: {
      itemNotFound: http404,
      unprocessableEntity: http422,
    },
    error: http500,
  },
}
