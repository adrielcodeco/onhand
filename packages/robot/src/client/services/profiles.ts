import { Api } from './api'

export class ProfilesService extends Api {
  protected resource = 'profiles'

  async list (): Promise<string[]> {
    return this.get({})
  }

  async save (profile: {
    profileName: string
    accessKey: string
    secretKey: string
    defaultRegion: string
  }) {
    return this.post({ data: profile })
  }
}

export const profilesService = new ProfilesService()
