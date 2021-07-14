import yeoman from 'yeoman-environment'

export type Templates = 'project' | 'route'

/**
 * Generate the scaffolding
 * @param template the template to be generated
 * @param options the parameters passed to generator
 */
export const generate = async (
  template: Templates,
  { cwd, projectData }: { cwd: string, projectData: any },
) => {
  const env = yeoman.createEnv('', { cwd, ...projectData })

  const getGenerator = async (template: Templates): Promise<any> => {
    switch (template) {
      case 'project': {
        const { default: generator } = await import('./projectGenerator')
        return generator
      }
    }
    throw 'invalid template'
  }

  const generator = await getGenerator(template)
  await env.runGenerator(generator)
}
