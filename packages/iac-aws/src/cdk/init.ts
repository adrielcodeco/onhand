import { Container } from 'typedi'
import { Options } from '#/app/options'
import { createFunctionsOptions } from '#/app/functions'
import { cdk, deployStacks } from './cdk'

export async function init (options: Options) {
  Container.set('options', options)
  const functions =
    options.config?.app?.type === 'api' ? createFunctionsOptions(options) : {}
  const { cli, configuration, sdkProvider } = await cdk(
    options,
    false,
    functions,
  )
  await deployStacks({
    cli,
    configuration,
    sdkProvider,
    options,
    promote: true,
  })
}
