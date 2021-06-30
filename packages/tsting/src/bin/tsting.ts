/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'
import 'source-map-support/register'
import yargs from 'yargs'
import { runEngineCommand } from '#/commands/runEngineCommand'
import { listCommand } from '#/commands/listCommand'
const { hideBin } = require('yargs/helpers')
const packageJson = require('../../package.json')

function main () {
  return yargs(hideBin(process.argv))
    .option('config', {
      alias: 'c',
      type: 'string',
      description: 'config file path',
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'show all log lines or only fails',
    })
    .option('bail', {
      alias: 'b',
      type: 'boolean',
      description: 'bail if found an error',
    })
    .option('noSetup', {
      alias: 'ns',
      type: 'boolean',
      description: 'ignore setup and teardown steps',
    })
    .option('replay', {
      alias: 'r',
      type: 'number',
      description: 'repeat the test a few times',
    })
    .command(
      '* [APIs..]',
      'execute all tests',
      yargs => {
        yargs.positional('APIs', {
          describe: 'ignore build step',
        })
      },
      argv => {
        (async () => {
          await runEngineCommand({
            configPath: argv.config,
            verbose: argv.verbose,
            bail: argv.bail,
            noSetup: argv.noSetup,
            replay: argv.replay,
            apis: argv.APIs as string[],
          })
        })().catch(err => {
          console.error(err)
          process.exit(1)
        })
      },
    )
    .command(
      'list',
      'list found tests',
      yargs => {
        // empty
      },
      argv => {
        (async () => {
          await listCommand({
            configPath: argv.config,
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
