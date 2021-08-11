import path from 'path'
import glob from 'glob'
import { Config } from '@onhand/iac-aws/#/app/config'
import { loadConfig } from '@onhand/iac-aws/#/app/loadConfig'
import { extractOpenAPISpecification } from '@onhand/openapi'
import { extractModels } from '#/server/reflection/models'
import { extractRepositories } from '#/server/reflection/repositories'
import { extractServices } from '#/server/reflection/services'
import { extractUseCases } from '#/server/reflection/usecases'

export const loadProjectData = async (cwd: string) => {
  const results = glob.sync('onhand.ts', { cwd })
  if (!results?.length) {
    return undefined
  }
  process.env.STAGE = 'dev'
  process.env.NO_PARAMETERS = 'true'
  const configPath = path.resolve(cwd, results[0])
  const options = loadConfig({ stage: process.env.STAGE }, configPath)
  const config: Partial<Config> = options.config!
  const openApiFilePath = path.resolve(cwd, config?.app?.openApi!)
  const openapi = extractOpenAPISpecification(openApiFilePath)
  const models = await extractModels(cwd, config)
  const repositories = await extractRepositories(cwd, config)
  const services = await extractServices(cwd, config)
  const useCases = await extractUseCases(cwd, config)
  return {
    options,
    config,
    openapi,
    models,
    repositories,
    services,
    useCases,
  }
}
