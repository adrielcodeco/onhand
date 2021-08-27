import fs from 'fs'
import path from 'path'
import * as git from '#/lib/git'
import { loadWorkspaceConfig } from '#/lib/workspaceConfig'

type initReposOptions = {
  verbose: boolean
}

export const initRepos = async (options: initReposOptions) => {
  const cwd = process.cwd()
  const config = loadWorkspaceConfig()
  for (const repository of config.repositories ?? []) {
    const repositoriesFolderPath = path.resolve(cwd, config.repositoriesFolder)
    const repoPath = path.resolve(repositoriesFolderPath, repository.folder)
    if (!fs.existsSync(repoPath)) {
      await git.clone(repositoriesFolderPath, repository.repo)
    }
    if (repository.branch) {
      await git.switchAndCreateBranchIfNotExists(repoPath, repository.branch)
      await git.pull(repoPath, repository.branch)
    }
    if (repository.tag) {
      await git.checkoutTag(repoPath, repository.tag)
      await git.pull(repoPath, repository.tag)
    }
  }
}
