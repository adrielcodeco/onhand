import path from 'path'
import { loadOnhandFile } from '#/engine/onhandFile'

async function main () {
  let [, , api] = process.argv

  const config = loadOnhandFile()

  if (config.testSetup) {
    const { beforeTest } = await import(config.testSetup)
    if (beforeTest) {
      await beforeTest()
    }
  }

  if (!path.isAbsolute(api)) {
    api = path.resolve(process.cwd(), api)
  }

  await import(api)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
