import { initRepos } from '#/lib/initRepos'

export async function initCommand (options: { verbose: boolean }) {
  await initRepos(options)
}
