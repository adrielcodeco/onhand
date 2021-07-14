import _ from 'lodash'
import nconf from 'nconf'
import short from 'short-uuid'
import { promisify } from 'util'
import { Request, Response, NextFunction } from 'express'
import { API } from '#/server/iApi'
import { generate } from '#/server/generators'
import { loadProjectData } from '#/server/loadProjectData'

export const listProjects: API = {
  method: 'get',
  path: '/projects',
  controller: async (req: Request, res: Response, next: NextFunction) => {
    const projects = nconf.get('projects') ?? []
    if (req.query && Object.keys(req.query).length) {
      const project = projects.find((p: any) => _.isMatch(p, req.query))
      if (!project) {
        res.status(404).end()
        return
      }
      res.json(project)
      return
    }
    res.json(projects)
  },
}

export const findProjects: API = {
  method: 'get',
  path: '/projects/:id',
  controller: async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    const projects = nconf.get('projects') ?? []
    const project = projects.find((p: any) => p.id === id)
    if (!project) {
      res.status(404).end()
      return
    }
    res.json(project)
  },
}

export const createProjects: API = {
  method: 'post',
  path: '/projects',
  controller: async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) {
      res.status(422).end()
      return
    }
    const projects = nconf.get('projects') ?? []
    projects.push({ id: short.generate(), ...req.body })
    nconf.set('projects', projects)
    const nconfSave = promisify(nconf.save).bind(nconf)
    await nconfSave()
    const projectData = await loadProjectData()
    const {
      cwdData: { cwd },
    } = (req as any).context
    await generate('project', { cwd, projectData })
    res.json(projects)
  },
}
