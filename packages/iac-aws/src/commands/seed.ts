import { loadConfig } from '#/app/loadConfig'
import { seed } from '#/app/seed'

export async function seedCommand (configPath?: string) {
  console.log('going to seeding')
  const options = loadConfig({}, configPath)
  await seed(options)
  console.log('seeding done')
}
