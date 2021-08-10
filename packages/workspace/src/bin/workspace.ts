/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'
import 'source-map-support/register'
import yargs from 'yargs'
import { createCommand } from '#/commands/createCommand'
import { addRepoCommand } from '#/commands/addRepoCommand'
import { removeRepoCommand } from '#/commands/removeRepoCommand'
import { initCommand } from '#/commands/initCommand'
import { updateCommand } from '#/commands/updateCommand'
const { hideBin } = require('yargs/helpers')
const packageJson = require('../../package.json')

function main () {
  return yargs(hideBin(process.argv))
    .usage('Usage: onhand-workspace COMMAND')
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'false',
    })
    .command(
      'create',
      'Create workspace',
      yargs => {
        // empty
      },
      argv => {
        (async () => {
          await createCommand({ verbose: !!argv.verbose })
        })().catch(err => {
          console.error(err)
          process.exit(1)
        })
      },
    )
    .command(
      'add-repo',
      'Add a repository to workspace',
      yargs => {
        // empty
      },
      argv => {
        (async () => {
          await addRepoCommand({ verbose: !!argv.verbose })
        })().catch(err => {
          console.error(err)
          process.exit(1)
        })
      },
    )
    .command(
      'remove-repo',
      'Remove a repository from workspace',
      yargs => {
        // empty
      },
      argv => {
        (async () => {
          await removeRepoCommand({ verbose: !!argv.verbose })
        })().catch(err => {
          console.error(err)
          process.exit(1)
        })
      },
    )
    .command(
      'init',
      'Init repositories from git',
      yargs => {
        // empty
      },
      argv => {
        (async () => {
          await initCommand({ verbose: !!argv.verbose })
        })().catch(err => {
          console.error(err)
          process.exit(1)
        })
      },
    )
    .command(
      'update',
      'Update repositories from git',
      yargs => {
        // empty
      },
      argv => {
        (async () => {
          await updateCommand({ verbose: !!argv.verbose })
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
