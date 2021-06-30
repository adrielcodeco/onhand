/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path'

export type Config = {
  verbose?: boolean
  bail?: boolean
  setup?: string
  testSetup?: string
  teardown?: string
  testRegex?: string[]
  ignore?: string[]
  report?: boolean
  cwd: string
}

export function loadOnhandFile (filePath?: string): Config {
  if (!filePath) {
    filePath = path.resolve(process.cwd(), './onhand.ts')
  }
  if (!path.isAbsolute(filePath)) {
    filePath = path.resolve(process.cwd(), filePath)
  }
  const cwd = path.dirname(filePath)
  const getConfig = require(filePath).default
  const configJson = getConfig({ env: 'dev' })
  if ('test' in configJson) {
    return {
      ...configJson.test,
      cwd,
    }
  }
  return { cwd }
}
