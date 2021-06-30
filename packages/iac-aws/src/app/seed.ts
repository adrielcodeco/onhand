/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path'
import glob from 'glob'
import { Options } from '#/app/options'
import { TimelineModelProvider } from '#/app/db/timeline'

export async function seed (options: Options) {
  const configPath = getConfigPath(options)
  if (!configPath) {
    return
  }
  const files = getSeedFiles(options)
  if (!files) {
    return
  }
  const { config } = require(/* webpackIgnore: true */ configPath)
  console.log('starting seed runner')
  await seedFiles(files, config)
}

export function getConfigPath (options: Options) {
  let configPath = options.config?.db?.config
  if (!configPath) {
    return
  }
  if (!path.isAbsolute(configPath)) {
    configPath = path.resolve(options.cwd, configPath)
  }
  return configPath
}

export function getSeedFiles (options: Options) {
  let seedsPath = options.config?.db?.seeds
  if (!seedsPath) {
    return
  }
  if (!path.isAbsolute(seedsPath)) {
    seedsPath = path.resolve(options.cwd, seedsPath)
  }
  const files = glob
    .sync('**/*.[tj]s', { cwd: seedsPath })
    .map(file => path.resolve(seedsPath!, file))

  return files
}

export async function seedFiles (files: string[], config: any) {
  console.log('onHand - loading config')
  await config()
  const TimelineModel = TimelineModelProvider()
  const seeds = await TimelineModel.scan('type').eq('seed').exec()
  const allSeeds = Array.from(seeds.values()).map(s => s.name)
  console.log(
    `onHand - ${allSeeds.length} seed${allSeeds.length > 1 ? 's' : ''} found`,
  )
  console.log(
    `onHand - ${files.length} seed${files.length > 1 ? 's' : ''} in folder`,
  )
  for (const file of files.sort()) {
    const fileName = path.basename(file)
    const exists = allSeeds.find(s => s === fileName)
    if (exists) {
      console.log(`onHand - OLD ${fileName}`)
      continue
    }
    const { sow } = require(/* webpackIgnore: true */ file)
    await sow()
    await TimelineModel.create({
      id: `seed#${fileName}`,
      name: fileName,
      type: 'seed',
    })
    console.log(`onHand - NEW ${fileName}`)
  }
}
