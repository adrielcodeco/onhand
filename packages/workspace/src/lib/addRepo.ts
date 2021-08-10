import path from 'path'
import { logIfPermitted } from '#/lib/log'
import * as git from '#/lib/git'
import {
  loadWorkspaceConfig,
  addRepoToWorkspace,
  RepoConfig,
} from '#/lib/workspaceConfig'

type addRepoOptions = {
  gitUrl: string
  folderName: string
  connection: string
  connectedTo: string
  verbose: boolean
}

export const addRepo = async (options: addRepoOptions) => {
  const { gitUrl, folderName, connection, connectedTo, verbose } = options
  const { repositoriesFolder } = loadWorkspaceConfig()
  let cwd = path.resolve(process.cwd(), repositoriesFolder)
  const log = logIfPermitted(verbose)
  log('Starting to add a repo...')
  await git.clone(cwd, gitUrl)
  cwd = path.resolve(cwd, folderName)
  const repoProperties: RepoConfig = {
    folder: folderName,
    repo: gitUrl,
  }
  const { tracking } = await git.status(cwd)
  if (connection === 'branch') {
    if (tracking === `origin/${connectedTo}`) {
      await git.pull(cwd, connectedTo)
    } else {
      await git.checkoutBranch(cwd, connectedTo)
    }
    repoProperties.branch = connectedTo
  } else {
    await git.checkoutTag(cwd, connectedTo)
    repoProperties.tag = connectedTo
  }
  addRepoToWorkspace(repoProperties)
}
