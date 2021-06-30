import { Engine } from '#/engine/engine'
import { loadOnhandFile } from '#/engine/onhandFile'

type I = {
  configPath?: string
}

export async function listCommand ({ configPath }: I) {
  const config = loadOnhandFile(configPath)
  const engine = new Engine(config)
  await engine.list()
}
