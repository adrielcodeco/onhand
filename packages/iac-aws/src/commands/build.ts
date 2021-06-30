import { loadConfig } from '#/app/loadConfig'
import { compile } from '#/app/webpack'

export async function buildCommand (
  configPath?: string,
  options?: { noBuild: boolean, stage?: string },
) {
  console.log('preparing to build')
  const config = loadConfig({ stage: options?.stage }, configPath)
  await compile(config)
}
