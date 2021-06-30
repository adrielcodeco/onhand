import { loadConfig } from '#/app/loadConfig'
import { pack } from '#/app/pack'

export async function packCommand (configPath?: string) {
  const options = loadConfig({}, configPath)
  await pack(options)
}
