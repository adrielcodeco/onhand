import path from 'path'
import prompts from 'prompts'
import { removeRepo } from '#/lib/removeRepo'
import { loadWorkspaceConfig } from '#/lib/workspaceConfig'
import { status } from '#/lib/git'

export async function removeRepoCommand (options: { verbose: boolean }) {
  const config = loadWorkspaceConfig()
  const defaults = { hasChanges: false }
  const answers = await prompts([
    {
      type: 'select',
      name: 'repoFolder',
      message: 'Which folder do you want to remove ?',
      choices: (config.repositories ?? []).map(repo => {
        return {
          title: repo.folder,
          description: repo.repo,
          value: repo.folder,
        }
      }),
      validate: async value => {
        try {
          const cwd = path.resolve(
            process.cwd(),
            config.repositoriesFolder,
            value,
          )
          const response = await status(cwd)
          defaults.hasChanges = !response.isClean()
        } catch (err) {
          console.error(err)
        }
        return true
      },
    },
    {
      type: () => (defaults.hasChanges ? 'confirm' : null),
      name: 'confirmIgnoreChanges',
      message: 'This repo has changes, do you want to ignore them ?',
      initial: false,
    },
  ])
  const fullOptions = Object.assign({}, defaults, options, answers)
  if (!fullOptions.repoFolder) {
    throw new Error('Invalid repo.')
  }
  if (defaults.hasChanges && !fullOptions.confirmIgnoreChanges) {
    return
  }
  await removeRepo(fullOptions)
}
