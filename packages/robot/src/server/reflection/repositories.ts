import path from 'path'
import { locate } from 'func-loc'
import { getBindingDictionary } from 'inversify/lib/planning/planner'
import { Config } from '@onhand/iac-aws/#/app/config'
import { container } from '@onhand/business/#/ioc/container'
import { isRepository } from '@onhand/framework/#/ioc/decorators'

export const extractRepositories = async (
  cwd: string,
  config: Partial<Config>,
) => {
  const iocPath = path.resolve(cwd, config.app?.ioc!)
  await import(iocPath)
  const repositories: any[] = []
  const bindingMap = getBindingDictionary(container).getMap()
  for (const [, value] of bindingMap) {
    for (const { implementationType } of value) {
      // eslint-disable-next-line no-prototype-builtins
      if (implementationType && isRepository(implementationType)) {
        const { source: classPath } = await locate(implementationType as any)
        const filePath = classPath.replace('file://', '')
        const relativePath = path.relative(cwd, filePath)
        const isExternal = !relativePath.startsWith(`${config.app?.src}/`)
        repositories.push({
          name: implementationType.name,
          filePath,
          relativePath,
          isExternal,
        })
      }
    }
  }
  return repositories
}
