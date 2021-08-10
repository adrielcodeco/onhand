import { Api } from './api'

export class FunctionsService extends Api {
  protected resource = 'projects/:projectId/envs/:env/functions'

  async list (projectId: string, env: string): Promise<any[]> {
    return this.get({ projectId, env })
  }

  async promote (
    projectId: string,
    env: string,
    to: string,
    operationId?: string,
  ): Promise<any[]> {
    return this.post({
      pathExt: `/${operationId ?? 'all'}`,
      projectId,
      env,
      data: { to },
    })
  }
}

export const functionsService = new FunctionsService()
