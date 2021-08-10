import nconf from 'nconf'
import { promisify } from 'util'
import { Project } from '#/server/dao/project'

const nconfSave = promisify(nconf.save).bind(nconf)

export const projectRepo = {
  list: (): Project[] => {
    const projects = nconf.get('projects') ?? []
    return projects
  },
  add: async (project: Project) => {
    const projects = projectRepo.list()
    projects.push(project)
    nconf.set('projects', projects)
    await nconfSave()
  },
}
