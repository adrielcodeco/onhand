/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const glob = require('glob')
const { seedFiles } = require('../../../app/seed')
const { config } = require('seeds/config')

async function seed () {
  try {
    const files = glob
      .sync('onhand-seed-function-*.js', { cwd: __dirname, nodir: true })
      .map((file: any) => path.resolve(__dirname, file))
    await seedFiles(files, config)
  } catch (err) {
    console.error(err)
    throw err
  }
}

export async function handler (event: any) {
  try {
    switch (event.RequestType) {
      case 'Create':
      case 'Update':
        await seed()
        break
      case 'Delete':
      default:
        console.log('does nothing on ', event.RequestType)
        break
    }
  } catch (err) {
    console.error(err)
    throw err
  }
}
