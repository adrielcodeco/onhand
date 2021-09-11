import _ from 'lodash'
import { Config } from '#/app/config'
import { OpenAPIV3 } from 'openapi-types'

export interface Options {
  stage: string
  appName: string
  packageName?: string
  packageVersion?: string
  awsProfile?: string
  awsRegion?: string
  awsAccount?: string
  cwd: string
  verbose: boolean
  ignoreErrors: boolean
  localServerPort?: string
  openApi?: OpenAPIV3.Document
  config?: Partial<Config>
}

export function isOptions (obj: any): obj is Options {
  return (
    typeof obj === 'object' &&
    !!obj &&
    'stage' in obj &&
    'appName' in obj &&
    obj.stage &&
    obj.appName
  )
}

export function resourceName (
  options: Options,
  resourceKeys: string | string[],
  noStage?: boolean,
): string {
  if (options.appName && resourceKeys) {
    const parts = []
    if (options.config?.app?.projectName) {
      parts.push(options.config?.app?.projectName)
    } else if (options.config?.app?.name) {
      parts.push(options.config?.app?.name)
    }
    if (options.stage && !noStage) {
      parts.push(options.stage)
    }
    if (typeof resourceKeys === 'string') {
      parts.push(resourceKeys)
    } else if (resourceKeys instanceof Array) {
      resourceKeys.forEach(i => parts.push(i))
    }
    if (options.config?.app?.projectName && options.config?.app?.name) {
      parts.push(options.config?.app?.name)
    }
    return _.chain(parts).join(' ').camelCase().value()
  }
  // eslint-disable-next-line prefer-rest-params
  throw new Error(`invalid arguments: ${JSON.stringify(arguments)}`)
}
