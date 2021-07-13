import { Api } from './api'

export class ConfigService extends Api {
  protected resource = 'config'

  async fetch (): Promise<any> {
    return this.get({})
  }
}

export const configService = new ConfigService()
