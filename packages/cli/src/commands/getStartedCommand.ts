import open from 'open'
import { app } from '@onhand/robot/#/server'

export async function getStartedCommand (options: {
  verbose: boolean
  port: string
}) {
  await app('get-started', Number(options.port))
  await open(`http://localhost:${options.port}`)
}
