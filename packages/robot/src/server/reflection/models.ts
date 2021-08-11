import path from 'path'
import { locate } from 'func-loc'
import { Config } from '@onhand/iac-aws/#/app/config'
import { container } from '@onhand/business/#/ioc/container'

export const extractModels = async (cwd: string, config: Partial<Config>) => {
  const iocPath = path.resolve(cwd, config.app?.ioc!)
  await import(iocPath)
  const models: any[] = []
  for (const model of container.getAll<any>(Symbol.for('models')) ?? []) {
    const { source: classPath } = await locate(model.schema)
    const filePath = classPath.replace('file://', '')
    const relativePath = path.relative(cwd, filePath)
    const isExternal = !relativePath.startsWith(`${config.app?.src}/`)
    models.push({
      name: model.tableName,
      filePath,
      relativePath,
      isExternal,
    })
  }
  return models
}
