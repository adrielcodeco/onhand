import path from 'path'
import fs from 'fs-extra'
import { promisify } from 'util'
import getPath from 'platform-folders'
import nconf from 'nconf'
import { models } from '#/server/models'

export const loadCwd = async () => {
  const cwd = process.cwd()
  const userData = getPath('userData') as string
  await fs.ensureDir(path.resolve(userData, 'onhand'))
  const file = path.resolve(userData, 'onhand/config.json')
  console.log('onhand config:', file)
  nconf.file({ file })
  nconf.set('cwd:last', cwd)
  models(userData)
  const nconfSave = promisify(nconf.save).bind(nconf)
  await nconfSave()
  const projects: any[] = nconf.get('projects') ?? []
  const isOnhandProject = !!projects.find(p => p.path === cwd)
  return {
    cwd,
    isOnhandProject,
    userData,
  }
}
