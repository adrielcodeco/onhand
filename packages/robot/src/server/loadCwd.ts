import path from 'path'
import fs from 'fs-extra'
import getPath from 'platform-folders'
import nconf from 'nconf'
import { configRepo } from '#/server/repositories/config'
import { models } from '#/server/models'
import { loadProjectData } from '#/server/loadProjectData'

export const loadCwd = async () => {
  const cwd = process.cwd()
  const userData = getPath('userData') as string
  await fs.ensureDir(path.resolve(userData, 'onhand'))
  const file = path.resolve(userData, 'onhand/config.json')
  console.log('onhand config:', file)
  nconf.file({ file })
  await configRepo.cwd.setLast(cwd)
  models(userData)
  const projectData = await loadProjectData(cwd)
  const isOnhandProject = !!projectData
  return {
    cwd,
    isOnhandProject,
    userData,
    projectData,
  }
}
