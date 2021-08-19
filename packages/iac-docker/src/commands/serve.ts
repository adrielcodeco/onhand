import { loadConfig } from '#/app/loadConfig'
import { serve } from '#/app/serve'

export async function serveCommand (
  configPath?: string,
  serverOptions?: {
    port: string
    watch: boolean
    setupDB: boolean
  },
) {
  const options = loadConfig({}, configPath)
  await serve(options, serverOptions)
}
