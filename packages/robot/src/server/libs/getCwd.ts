import { Request } from 'express'
import { projectRepo } from '#/server/repositories/project'

export const getCwd = (req: Request, projectId: string) => {
  let cwd
  if (projectId === 'cwd') {
    const { cwdData } = (req as any).context
    cwd = cwdData.cwd
  } else {
    const projects = projectRepo.list()
    const project = projects.find((p: any) => p.id === projectId)
    if (project) {
      cwd = project.path
    }
  }
  return cwd
}
