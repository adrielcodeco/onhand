/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'
import 'source-map-support/register'
import yargs from 'yargs'
import { getStartedCommand } from '#/commands/getStartedCommand'
const { hideBin } = require('yargs/helpers')
const packageJson = require('../../package.json')

function main () {
  return yargs(hideBin(process.argv))
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Show all log lines or only fails',
    })
    .command(
      'get-started',
      'This command starts a wizard to help you set up your project',
      yargs => {
        // empty
      },
      argv => {
        (async () => {
          await getStartedCommand({
            verbose: !!argv.verbose,
          })
        })().catch(console.error)
      },
    )
    .version(packageJson.version)
    .showHelpOnFail(false)
    .help()
    .alias('h', 'help').argv
}

main()
