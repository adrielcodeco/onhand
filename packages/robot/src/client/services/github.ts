import { Api } from './api'

export class GithubService extends Api {
  protected resource = 'github'

  async getDeviceCode () {
    return this.get({ pathExt: '/device-code' })
  }

  async getAccessCode (deviceCode: string) {
    return this.get({ pathExt: '/access-code', params: { deviceCode } })
  }
}

export const githubService = new GithubService()
