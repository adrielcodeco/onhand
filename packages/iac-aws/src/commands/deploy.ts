import { loadConfig } from '#/app/loadConfig'
import { deploy } from '#/cdk/deploy'
import debug from 'debug'

const log = debug('onhand:iac')

export async function deployCommand (
  configPath?: string,
  options?: { noBuild: boolean, stage?: string, promote?: boolean },
) {
  console.log('preparing to deploy')
  const config = loadConfig({ stage: options?.stage }, configPath)
  log('config: %O', config)
  const deployOptions = {
    noBuild: !!options?.noBuild,
    promote: !!options?.promote,
  }
  await deploy(config, deployOptions)
}
