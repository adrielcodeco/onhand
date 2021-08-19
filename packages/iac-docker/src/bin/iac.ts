/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'
import 'source-map-support/register'
import yargs from 'yargs'
import { listRulesCommand } from '#/commands/listRules'
import { openApiCommand } from '#/commands/openApi'
import { serveCommand } from '#/commands/serve'
const { hideBin } = require('yargs/helpers')
const packageJson = require('../../package.json')

function main () {
  return yargs(hideBin(process.argv))
    .usage('Usage: onhand-iac-docker COMMAND')
    .option('config', {
      alias: 'c',
      type: 'string',
      description: 'config file path',
    })
    .command(
      'openapi [output]',
      'export the OpenAPi file',
      yargs => {
        yargs.positional('output', {
          describe: 'output path to save OpenApi file',
          default: '',
        })
      },
      argv => {
        (async () => {
          await openApiCommand(argv.config, String(argv.output))
        })().catch(err => {
          console.error(err)
          process.exit(1)
        })
      },
    )
    .command(
      'serve',
      'execute lambda locally',
      yargs => {
        yargs.option('port', {
          describe: 'port to listen',
          default: '4100',
        })
        yargs.option('watch', {
          describe: 'watch src files',
          boolean: true,
          default: true,
        })
        yargs.option('setupDB', {
          describe: 'setup db with migrations and seeds',
          boolean: true,
          default: true,
        })
      },
      argv => {
        (async () => {
          await serveCommand(argv.config, {
            port: argv.port as string,
            watch: !!argv.watch,
            setupDB: !!argv.setupDB,
          })
        })().catch(err => {
          console.error(err)
          process.exit(1)
        })
      },
    )
    .command(
      'list-rules',
      'list all rules',
      yargs => {
        // empty
      },
      argv => {
        (async () => {
          await listRulesCommand(argv.config)
        })().catch(err => {
          console.error(err)
          process.exit(1)
        })
      },
    )
    .version(packageJson.version)
    .demandCommand(1, '') // just print help
    .recommendCommands()
    .help()
    .alias('h', 'help').argv
}

main()
