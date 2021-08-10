import path from 'path'
import { logIfPermitted } from '#/lib/log'
import { generate } from '#/lib/generators'
import { createRepo, initRepo, commitChanges, pushToRemote } from '#/lib/git'
import { setWorkspaceConfig } from '#/lib/workspaceConfig'

type createWorkspaceOptions = {
  workspaceName: string
  repositoriesFolder: string
  pushToGit: boolean
  githubAccessToken: string
  githubProjectName: string
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
    githubPrivateRepo,
    githubLogin,
    verbose,
  } = options
  let cwd = process.cwd()
  const log = logIfPermitted(verbose)
  log('Starting workspace creation...')
  let repoUrl: string
  if (pushToGit) {
    log('Creating github repo...')
    const { clone_url: cloneUrl } = await createRepo(
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
  cwd = path.resolve(cwd, workspaceName)
  await setWorkspaceConfig(
    {
      workspaceName,
      repositoriesFolder,
      repositories: [],
    },
    cwd,
  )
  if (pushToGit) {
    await initRepo(cwd, repoUrl!)
    await commitChanges(cwd, 'chore: Initializing the workspace')
    await pushToRemote(cwd)
  }
}
