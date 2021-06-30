import fs from 'fs'
import { loadConfig } from '#/app/loadConfig'
import { getOpenAPI } from '#/app/getOpenApi'

export function openApiCommand (configPath?: string, output?: string) {
  const options = loadConfig({}, configPath)
  const openApi = getOpenAPI(options)
  if (!output) {
    console.log(openApi)
  } else {
    fs.writeFileSync(output, openApi, 'utf-8')
  }
}
