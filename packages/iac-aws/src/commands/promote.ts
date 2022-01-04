import { loadConfig } from '#/app/loadConfig'
import { deploy } from '#/cdk/deploy'

export async function promoteCommand (
  configPath?: string,
  options?: { stage?: string },
) {
  const config = loadConfig({ stage: options?.stage }, configPath)
  await deploy(config, { noBuild: true, promote: true, newVersion: false })
}
