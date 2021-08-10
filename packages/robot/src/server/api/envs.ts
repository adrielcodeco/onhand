import { Request, Response, NextFunction } from 'express'
import { API } from '#/server/iApi'
import { readEnvs } from '#/server/libs/readEnvs'
import { getCwd } from '#/server/libs/getCwd'

export const listEnvs: API = {
  method: 'get',
  path: '/projects/:projectId/envs',
  controller: async (req: Request, res: Response, next: NextFunction) => {
    const projectId = req.params.projectId
    const cwd = getCwd(req, projectId)
    if (!cwd) {
      res.status(404).end()
      return
    }
    const envs = await readEnvs(cwd)
    if (envs) {
      if (!(req as any).context.envs) {
        (req as any).context.envs = {}
      }
      Object.assign((req as any).context.envs, { [projectId]: envs })
    }
    res.json(envs)
  },
}
