import { Container } from 'typedi'
import { Options } from '#/app/options'
import { createFunctionsOptions } from '#/app/functions'
import { cdk, deployStacks } from './cdk'

export async function init (options: Options) {
  Container.set('options', options)
  const functions =
    options.config?.app?.type === 'api' ? createFunctionsOptions(options) : {}
  const promote = false
  const newVersion = false
  const { cli, configuration, sdkProvider } = await cdk(
    options,
    promote,
    newVersion,
    functions,
  )
  await deployStacks({
    cli,
    configuration,
    sdkProvider,
    options,
    promote,
    newVersion,
  })
}
