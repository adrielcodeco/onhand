import { Method, AxiosResponse } from 'axios'
import { Logger } from '#/engine/log'

export type APIConfig = {
  baseUrl: string
  path: string
  method: Method
  headers?: any
}

export class TestContext {
  steps: Array<() => Promise<any>> = []
  api: APIConfig = { baseUrl: '', path: '', method: 'get' }
  currentRequest: {
    params: Map<string | RegExp, string>
    body?: any
    response?: AxiosResponse
    failed?: boolean
    clear: () => void
  } = {
    params: new Map(),
    clear: () => {
      this.currentRequest.body = undefined
      this.currentRequest.response = undefined
      this.currentRequest.failed = undefined
    },
  }

  count: { success: number, fail: number, tags: string[] } = {
    success: 0,
    fail: 0,
    tags: [],
  }

  context: any = {}
  log = new Logger()
  runner: 'engine' | 'self' =
  process.env.TEST_ENGINE === 'true' ? 'engine' : 'self'
}
