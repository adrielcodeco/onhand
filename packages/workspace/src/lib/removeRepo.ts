import fs from 'fs'
import path from 'path'
import { logIfPermitted } from '#/lib/log'
import {
  loadWorkspaceConfig,
  removeRepoToWorkspace,
} from '#/lib/workspaceConfig'

type removeRepoOptions = {
  repoFolder: string
  confirmIgnoreChanges: boolean
  verbose: boolean
}

export const removeRepo = async (options: removeRepoOptions) => {
  const { repoFolder, verbose } = options
  const cwd = process.cwd()
  const { repositoriesFolder } = loadWorkspaceConfig()
  const log = logIfPermitted(verbose)
  log('Starting to remove a repo...')
  const folder = path.resolve(cwd, repositoriesFolder, repoFolder)
  fs.rmSync(folder, { recursive: true, force: true })
  removeRepoToWorkspace(repoFolder)
}
