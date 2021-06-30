import { Container } from 'typedi'
import { Options } from '#/app/options'
import { compile } from '#/app/webpack'
import { createFunctionsOptions } from '#/app/functions'
import { pack } from '#/app/pack'
import { cdk, deployStacks } from './cdk'

export async function deploy (
  options: Options,
  deployOptions?: { noBuild: boolean, promote: boolean },
) {
  Container.set('options', options)

  if (!deployOptions?.noBuild) {
    const bundles = await compile(options)
    await pack(
      options,
      options.config?.app?.type === 'api' ? bundles : undefined,
    )
  }

  const functions =
    options.config?.app?.type === 'api' ? createFunctionsOptions(options) : {}

  const { cli, configuration, sdkProvider } = await cdk(
    options,
    !!deployOptions?.promote,
    functions,
  )

  await deployStacks({
    cli,
    configuration,
    sdkProvider,
    options,
    promote: !!deployOptions?.promote,
  })
}
