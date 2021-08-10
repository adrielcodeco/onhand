import _ from 'lodash'
import short from 'short-uuid'
import { Request, Response, NextFunction } from 'express'
import { API } from '#/server/iApi'
import { generate } from '#/server/generators'
import { projectRepo } from '#/server/repositories/project'
import { loadProjectData } from '#/server/loadProjectData'

export const listProjects: API = {
  method: 'get',
  path: '/projects',
  controller: async (req: Request, res: Response, next: NextFunction) => {
    const projects = projectRepo.list()
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
    if (id === 'cwd') {
      const {
        cwdData: { cwd, isOnhandProject, projectData },
      } = (req as any).context
      if (!isOnhandProject) {
        res.status(404).end()
        return
      }
      res.json({
        id: 'cwd',
        name: projectData.config.app.name,
        path: cwd,
        type: projectData.config.app.type,
        projectData,
      })
      return
    }
    const projects = projectRepo.list()
    const project = projects.find((p: any) => p.id === id)
    if (!project) {
      res.status(404).end()
      return
    }
    const projectData = await loadProjectData(project.path)
    res.json({ ...project, projectData })
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
    const project = { id: short.generate(), ...req.body }
    await projectRepo.add(project)
    const {
      cwdData: { cwd },
    } = (req as any).context
    const projectData = await loadProjectData(cwd)
    await generate('project', { cwd, projectData })
    res.json(project)
  },
}
