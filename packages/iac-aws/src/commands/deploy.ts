import { loadConfig } from '#/app/loadConfig'
import { deploy } from '#/cdk/deploy'

export async function deployCommand (
  configPath?: string,
  options?: { noBuild: boolean, stage?: string },
) {
  console.log('preparing to deploy')
  const config = loadConfig({ stage: options?.stage }, configPath)
  const deployOptions = {
    noBuild: !!options?.noBuild,
    promote: false,
  }
  await deploy(config, deployOptions)
}
