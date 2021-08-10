/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs'
import path from 'path'
import { Options } from './options'
import { Config, defaultConfig } from './config'
import { extractOpenAPISpecification } from '@onhand/openapi'

const defaultOptions: Options = {
  stage: 'dev',
  appName: 'app',
  cwd: process.cwd(),
  verbose: defaultConfig.deploy?.verbose!,
  ignoreErrors: defaultConfig.deploy?.ignoreErrors!,
}

export function loadConfig (
  { stage }: { stage?: string },
  configPath?: string,
  defaults?: Options,
): Options {
  if (!configPath) {
    configPath = `${process.cwd()}/onhand.ts`
  }
  try {
    if (!stage) {
      stage = defaultOptions.stage
    }
    const options: Partial<Options> = {}
    const configPathResolved = path.isAbsolute(configPath)
      ? configPath
      : path.resolve(process.cwd(), configPath)
    options.cwd = path.dirname(configPathResolved)
    const getConfig = require(configPathResolved).default
    const configJson: Partial<Config> = getConfig({ stage }) as Partial<Config>
    options.config = configJson
    if (
      typeof configJson === 'object' &&
      !!configJson &&
      'app' in configJson &&
      configJson.app
    ) {
      load(configJson.app, ['name', 'appName'], options)
    }
    if (
      typeof configJson === 'object' &&
      !!configJson &&
      'deploy' in configJson &&
      configJson.deploy
    ) {
      load(configJson.deploy, ['verbose'], options)
      load(configJson.deploy, ['ignoreErrors'], options)
      load(configJson.deploy, ['awsProfile'], options)
      load(configJson.deploy, ['awsRegion'], options)
    }
    const pkgJsonPath = path.resolve(process.cwd(), 'package.json')
    const pkg = fs.readFileSync(pkgJsonPath, 'utf8')
    const packageJson = JSON.parse(pkg)
    options.packageName = packageJson.name
    options.packageVersion = packageJson.version
    options.awsRegion = process.env.AWS_REGION ?? configJson.deploy?.awsRegion
    const result = Object.assign(
      defaults ?? {},
      defaultOptions,
      { stage },
      options,
    )
    Object.defineProperty(result, 'openApi', {
      get: function () {
        if (!this._openapi) {
          const openApiFilePath = path.resolve(
            this.cwd,
            this.config.app?.openApi,
          )
          this._openapi = extractOpenAPISpecification(openApiFilePath)
        }
        return this._openapi
      },
    })
    return result
  } catch (err) {
    console.error(err)
    return defaultOptions
  }
}

function load (
  from: any,
  property: [string, string?],
  options: Partial<Options>,
) {
  const originProperty = property[0]
  const destinyProperty = property.length === 1 ? property[0] : property[1]!
  if (originProperty in from && from[originProperty]) {
    Reflect.set(options, destinyProperty, from[originProperty])
  }
}
