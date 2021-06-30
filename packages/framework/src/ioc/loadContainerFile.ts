import fs from 'fs'
import path from 'path'
import { EOL } from 'os'
import { ContainerModule, interfaces } from 'inversify'
import { container } from '@onhand/business/#/ioc/container'

export function loadContainerFile (filePath: string) {
  if (!path.isAbsolute(filePath)) {
    filePath = path.resolve(process.cwd(), filePath)
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`container file not found in path: ${filePath}`)
  }
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const lines = fileContent.split(EOL)
  const containerFileModule = new ContainerModule(
    (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
      for (const line of lines) {
        const [key, value] = line.split('=')
        bind(key.trim()).toConstantValue(value.trim())
      }
    },
  )
  container.load(containerFileModule)
}
