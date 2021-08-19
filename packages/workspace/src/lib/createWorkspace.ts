import path from 'path'
import { logIfPermitted } from '#/lib/log'
import { generate } from '#/lib/generators'
import * as git from '#/lib/git'
import { setWorkspaceConfig } from '#/lib/workspaceConfig'

type createWorkspaceOptions = {
  workspaceName: string
  repositoriesFolder: string
  pushToGit: boolean
  githubAccessToken: string
  githubProjectName: string
  githubDefaultBranchName: string
  githubPrivateRepo: boolean
  githubLogin: string
  verbose: boolean
}

export const createWorkspace = async (options: createWorkspaceOptions) => {
  const {
    workspaceName,
    repositoriesFolder,
    pushToGit,
    githubAccessToken,
    githubProjectName,
    githubDefaultBranchName,
    githubPrivateRepo,
    githubLogin,
    verbose,
  } = options
  const cwd = process.cwd()
  const projCwd = path.resolve(cwd, workspaceName)
  const log = logIfPermitted(verbose)
  log('Starting workspace creation...')
  let repoUrl = ''
  if (pushToGit) {
    log('Creating github repo...')
    const { clone_url: cloneUrl } = await git.createRepo(
      githubAccessToken,
      githubProjectName,
      githubPrivateRepo,
      githubLogin,
      verbose,
    )
    repoUrl = cloneUrl
  }
  await generate({
    cwd,
    workspaceConfig: { workspaceName, repositoriesFolder },
  })
  await setWorkspaceConfig(
    {
      workspaceName,
      repositoriesFolder,
      repositories: [],
    },
    projCwd,
  )
  if (pushToGit) {
    await git.initRepo(projCwd, repoUrl)
    await git.pull(projCwd, githubDefaultBranchName)
    await git.commitChanges(projCwd, 'chore: Initializing the workspace')
    await git.pushToRemote(projCwd, githubDefaultBranchName)
  }
}
