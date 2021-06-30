import { promisify } from 'util'
import { exec } from 'child_process'
import { Options } from '#/app/options'

const execSync = promisify(exec)

export async function build (options: Options) {
  await execSync('yarn build', { cwd: options.cwd })
}
