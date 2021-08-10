import { Api } from './api'
import { Env } from '#/client/dto/env'

export class EnvsService extends Api {
  protected resource = 'projects/:projectId/envs'

  async list (projectId: string): Promise<Env[]> {
    return this.get({ projectId })
  }
}

export const envsService = new EnvsService()
