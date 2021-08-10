import prompts from 'prompts'
import { addRepo } from '#/lib/addRepo'

export async function addRepoCommand (options: { verbose: boolean }) {
  const defaults = {}
  const answers = await prompts([
    {
      type: 'text',
      name: 'gitUrl',
      message: 'What is the git url of the repo that you want to clone ?',
    },
    {
      type: 'text',
      name: 'folderName',
      message: 'What should be the folder name where it should be cloned ?',
      initial: (prev, values, prompt) => {
        const parts = prev.split('/')
        return parts[parts.length - 1].replace(/\.git$/, '')
      },
    },
    {
      type: 'select',
      name: 'connection',
      message: 'Connect to ... ?',
      choices: [
        {
          title: 'Branch',
          description: 'Connected to the branch',
          value: 'branch',
        },
        { title: 'Tag', description: 'Connected to the tag', value: 'tag' },
      ],
      initial: 0,
    },
    {
      type: 'text',
      name: 'connectedTo',
      message: 'Do you want to push it to github ?',
      initial: (prev, values, prompt) => {
        switch (prev) {
          case 'branch':
            return 'main'
          case 'tag':
            return 'v1.0.0'
          default:
            return ''
        }
      },
    },
  ])
  const fullOptions = Object.assign({}, defaults, options, answers)
  if (!fullOptions.gitUrl) {
    throw new Error('The git url is required')
  }
  if (!fullOptions.connection || !fullOptions.connectedTo) {
    throw new Error('invalid repo connection')
  }
  await addRepo(fullOptions)
}
