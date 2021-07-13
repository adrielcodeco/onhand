import open from 'open'
import { app } from '@onhand/robot/#/server'

export async function startDashboardCommand (options: {
  verbose: boolean
  port: string
  noOpen: boolean
}) {
  await app({
    port: Number(options.port),
    verbose: options.verbose,
  })
  if (!options.noOpen) {
    await open(`http://localhost:${options.port}`)
  }
}
