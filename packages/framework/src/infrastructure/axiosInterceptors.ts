import axios from 'axios'
import short from 'short-uuid'
import { container } from '@onhand/business/#/ioc/container'
import { ILogger, LogToken } from '@onhand/business/#/modules/logger'

export function interceptors (): void {
  const logger = container.get<ILogger>(LogToken)
  axios.interceptors.request.use(
    function (config) {
      const requestId = short.generate()
      Reflect.set(config, 'requestId', requestId)
      const headers = {}
      if (config.headers) {
        for (const header in config.headers) {
          if (typeof config.headers[header] === 'object') {
            Object.assign(headers, config.headers[header])
          } else {
            Object.assign(headers, { [header]: config.headers[header] })
          }
        }
        Object.assign(headers, config.headers[config.method ?? ''])
      }
      const req = {
        requestId: requestId,
        url: `${config.baseURL ?? ''}${config.url ?? ''}`,
        method: config.method,
        data: config.data,
        headers,
      }
      logger.info('axios.req:', req)
      return config
    },
    function (error) {
      logger.error('axios.error:', error)
      throw error
    },
  )
  axios.interceptors.response.use(
    function (response) {
      const requestId = Reflect.get(response.config, 'requestId')
      const res = {
        requestId: requestId,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      }
      logger.info('axios.res:', res)
      return response
    },
    function (error) {
      const res = {
        responseId: error.response.config.requestId,
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data,
      }
      logger.error('axios.error:', { message: error.message, res })
      throw error
    },
  )
}
