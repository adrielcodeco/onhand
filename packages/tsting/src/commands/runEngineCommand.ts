import { Engine } from '#/engine/engine'
import { loadOnhandFile } from '#/engine/onhandFile'

type I = {
  configPath?: string
  verbose?: boolean
  bail?: boolean
  noSetup?: boolean
  replay?: number
  apis?: string[]
}

export async function runEngineCommand ({
  configPath,
  verbose,
  bail,
  noSetup,
  replay,
  apis,
}: I) {
  const config = loadOnhandFile(configPath)
  if (verbose !== undefined) {
    config.verbose = verbose
  }
  if (bail !== undefined) {
    config.bail = bail
  }
  if (noSetup) {
    config.setup = undefined
    config.teardown = undefined
  }
  const engine = new Engine(config)
  await engine.start(apis, replay)
}
