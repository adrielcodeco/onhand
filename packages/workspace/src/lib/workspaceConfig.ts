import fs from 'fs'
import path from 'path'

export interface RepoConfig {
  folder: string
  repo: string
  branch?: string
  tag?: string
  [key: string]:
  | {
    branch?: string
    tag?: string
  }
  | any
}

export interface WorkspaceConfig {
  workspaceName: string
  repositoriesFolder: string
  repositories?: RepoConfig[]
}

const getConfigPath = (createIfNotExists = false, cwd = process.cwd()) => {
  const configPath = path.resolve(cwd, 'onhand.workspace.json')
  if (!fs.existsSync(configPath)) {
    if (createIfNotExists) {
      fs.writeFileSync(configPath, '', { encoding: 'utf-8' })
    } else {
      throw new Error('onhand.workspace.json not found')
    }
  }
  return configPath
}

export const loadWorkspaceConfig = (): WorkspaceConfig => {
  const configPath = getConfigPath()
  const json = fs.readFileSync(configPath, { encoding: 'utf-8' })
  const config = JSON.parse(json) as WorkspaceConfig
  return config
}

export const setWorkspaceConfig = (
  config: WorkspaceConfig,
  cwd = process.cwd(),
) => {
  const configPath = getConfigPath(true, cwd)
  fs.writeFileSync(configPath, JSON.stringify(config), { encoding: 'utf-8' })
}

export const addRepoToWorkspace = (repo: RepoConfig) => {
  const configPath = getConfigPath()
  const json = fs.readFileSync(configPath, { encoding: 'utf-8' })
  const config = JSON.parse(json) as WorkspaceConfig
  config.repositories?.push(repo)
  fs.writeFileSync(configPath, JSON.stringify(config), { encoding: 'utf-8' })
}

export const removeRepoToWorkspace = (repoFolder: string) => {
  const configPath = getConfigPath()
  const json = fs.readFileSync(configPath, { encoding: 'utf-8' })
  const config = JSON.parse(json) as WorkspaceConfig
  config.repositories = config.repositories?.filter(
    r => r.folder !== repoFolder,
  )
  fs.writeFileSync(configPath, JSON.stringify(config), { encoding: 'utf-8' })
}
