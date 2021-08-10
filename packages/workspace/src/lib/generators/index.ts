import yeoman from 'yeoman-environment'
import { WorkspaceConfig } from '#/lib/workspaceConfig'
import { WorkspaceGenerator } from './workspaceGenerator'

/**
 * Generate the scaffolding
 * @param template the template to be generated
 * @param options the parameters passed to generator
 */
export const generate = async ({
  cwd,
  workspaceConfig,
}: {
  cwd: string
  workspaceConfig: WorkspaceConfig
}) => {
  const env = yeoman.createEnv('', { cwd, workspaceConfig })
  env.registerStub(WorkspaceGenerator, 'workspace')
  const generator = env.create('workspace')
  if (generate instanceof Error) {
    throw generator
  }
  await env.runGenerator(generator as any)
}
