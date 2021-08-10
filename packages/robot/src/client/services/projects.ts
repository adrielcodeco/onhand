import { Api } from './api'
import { Project } from '#/client/dto/project'

export class ProjectService extends Api {
  protected resource = 'projects'

  async list(): Promise<Project[]> {
    return this.get({})
  }

  async find(id: string): Promise<Project> {
    return this.get({ id })
  }

  async create(data: Partial<Project>) {
    return this.post({ data })
  }

  async alter(id: string, data: Partial<Project>) {
    return this.put({ id, data })
  }

  async remove(id: string) {
    return this.delete({ id })
  }

  async pathAlreadyExists(path: string) {
    return this.get({ params: { path } })
  }
}

export const projectService = new ProjectService()
