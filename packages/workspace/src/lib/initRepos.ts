import fs from 'fs'
import path from 'path'
import { clone, checkoutBranch, checkoutTag, pull } from '#/lib/git'
import { loadWorkspaceConfig } from '#/lib/workspaceConfig'

type initReposOptions = {
  verbose: boolean
}

export const initRepos = async (options: initReposOptions) => {
  const cwd = process.cwd()
  const config = loadWorkspaceConfig()
  for (const repository of config.repositories ?? []) {
    const repoPath = path.resolve(
      cwd,
      config.repositoriesFolder,
      repository.folder,
    )
    if (!fs.existsSync(repoPath)) {
      await clone(repoPath, repository.repo)
    }
    if (repository.branch) {
      await checkoutBranch(repoPath, repository.branch)
      await pull(repoPath, repository.branch)
    }
    if (repository.tag) {
      await checkoutTag(repoPath, repository.tag)
      await pull(repoPath, repository.tag)
    }
  }
}
