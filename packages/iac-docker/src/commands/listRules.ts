import { loadConfig } from '#/app/loadConfig'
import { listRules } from '#/app/listRules'

export async function listRulesCommand (configPath?: string) {
  const options = loadConfig({}, configPath)
  await listRules(options)
}
