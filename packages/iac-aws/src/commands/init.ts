import { loadConfig } from '#/app/loadConfig'
import { init } from '#/cdk/init'

export async function initCommand (configPath?: string) {
  const config = loadConfig({}, configPath)
  await init(config)
}
