/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'
import 'source-map-support/register'
import yargs from 'yargs'
import { startDashboardCommand } from '#/commands/startDashboardCommand'
const { hideBin } = require('yargs/helpers')
const packageJson = require('../../package.json')

function main () {
  const argv = yargs(hideBin(process.argv))
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Show all log lines or only fails',
    })
    .option('port', {
      alias: 'p',
      describe: 'port to listen',
      default: '4100',
    })
    .option('noOpen', {
      alias: 'noo',
      describe: 'not open in browser',
      type: 'boolean',
      default: false,
    })
    .version(packageJson.version)
    .showHelpOnFail(true)
    .help()
    .alias('h', 'help').argv

  if (argv.h) {
    return undefined
  }

  (async () => {
    await startDashboardCommand({
      verbose: !!argv.verbose,
      port: argv.port,
      noOpen: !!argv.noOpen,
    })
  })().catch(console.error)

  return undefined
}

main()
