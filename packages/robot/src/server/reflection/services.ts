import path from 'path'
import { locate } from 'func-loc'
import { getBindingDictionary } from 'inversify/lib/planning/planner'
import { Config } from '@onhand/iac-aws/#/app/config'
import { container } from '@onhand/business/#/ioc/container'
import { isService } from '@onhand/framework/#/ioc/decorators'

export const extractServices = async (cwd: string, config: Partial<Config>) => {
  const iocPath = path.resolve(cwd, config.app?.ioc!)
  await import(iocPath)
  const services: any[] = []
  const bindingMap = getBindingDictionary(container).getMap()
  for (const [, value] of bindingMap) {
    for (const { implementationType } of value) {
      // eslint-disable-next-line no-prototype-builtins
      if (implementationType && isService(implementationType)) {
        const { source: classPath } = await locate(implementationType as any)
        const filePath = classPath.replace('file://', '')
        const relativePath = path.relative(cwd, filePath)
        const isExternal = !relativePath.startsWith(`${config.app?.src}/`)
        services.push({
          name: implementationType.name,
          filePath,
          relativePath,
          isExternal,
        })
      }
    }
  }
  return services
}
