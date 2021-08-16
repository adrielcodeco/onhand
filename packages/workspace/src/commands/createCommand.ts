import prompts from 'prompts'
import { checkAccess } from '#/lib/git'
import { createWorkspace } from '#/lib/createWorkspace'

export async function createCommand (options: { verbose: boolean }) {
  const { verbose } = options
  const defaults = {
    workspaceName: 'workspace',
    repositoriesFolder: 'repositories',
    githubLogin: '',
  }
  const answers = await prompts(
    [
      {
        type: 'text',
        name: 'workspaceName',
        message: 'What will be the workspace name ?',
        initial: defaults.workspaceName,
      },
      {
        type: 'text',
        name: 'repositoriesFolder',
        message: 'What will be the name of the repositories folder ?',
        initial: defaults.repositoriesFolder,
      },
      {
        type: 'confirm',
        name: 'pushToGit',
        message: 'Do you want to push it to github ?',
        initial: true,
      },
      {
        type: prev => (prev === true ? 'password' : null),
        name: 'githubAccessToken',
        message: 'What Github Personal Access Token can I use ?',
        validate: async value => {
          const login = await checkAccess(value, verbose)
          defaults.githubLogin = login
          return !!login
        },
        // @ts-expect-error
        error: 'Invalid Github Personal Access Token',
      },
      {
        type: prev => (prev ? 'text' : null),
        name: 'githubProjectName',
        message: 'What will be the Github project name ?',
        initial: (prev, values, prompt) => {
          return values.workspaceName
        },
      },
      {
        type: prev => (prev ? 'confirm' : null),
        name: 'githubPrivateRepo',
        message: 'Do you want to make the repo private ?',
        initial: true,
      },
    ],
    {
      onCancel: () => {
        console.log('canceled by user')
        process.exit(1)
      },
    },
  )
  const fullOptions = Object.assign({}, defaults, options, answers)
  if (!fullOptions.workspaceName) {
    throw new Error('The workspace name is required')
  }
  if (!fullOptions.repositoriesFolder) {
    throw new Error('The name of the repositories folder is required')
  }
  await createWorkspace(fullOptions)
}
