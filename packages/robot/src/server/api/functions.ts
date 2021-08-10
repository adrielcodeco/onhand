import { Request, Response, NextFunction } from 'express'
import { API } from '#/server/iApi'
import { projectRepo } from '#/server/repositories/project'
import { loadProjectData } from '#/server/loadProjectData'
import { readEnvs } from '#/server/libs/readEnvs'
import { fetchEnvVersions } from '#/server/libs/fetchEnvVersions'

export const listEnvs: API = {
  method: 'get',
  path: '/projects/:projectId/envs/:env/functions',
  controller: async (req: Request, res: Response, next: NextFunction) => {
    const projectId = req.params.projectId
    const env = req.params.env
    let projectData
    let cwd
    if (projectId === 'cwd') {
      const { cwdData } = (req as any).context
      projectData = cwdData.projectData
      cwd = cwdData.cwd
    } else {
      const projects = projectRepo.list()
      const project = projects.find((p: any) => p.id === projectId)
      if (project) {
        cwd = project.path
        projectData = await loadProjectData(cwd)
      }
    }
    const routes = projectData?.openapi?.paths
    const operationIds: any[] = []
    for (const path in routes) {
      for (const method in routes[path]) {
        const { operationId } = routes[path][method]
        operationIds.push(operationId)
      }
    }
    const {
      cwdData: {
        projectData: { options },
      },
    } = (req as any).context
    const envs = await readEnvs(cwd)
    const { profileName, region } = envs.find(e => e.name === env)!
    const functions = await fetchEnvVersions(env, options, profileName, region)
    res.json(functions)
  },
}

export const promoteFunctions: API = {
  method: 'post',
  path: '/projects/:projectId/envs/:env/functions/:operationId',
  controller: async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) {
      res.status(422).end()
      return
    }
    // const projectId = req.params.projectId
    // const env = req.params.env
    // const operationId = req.params.operationId
    // const { to } = req.body
    // const promoteAll = operationId === 'all'
    // TODO:
    res.json({ success: true })
  },
}
