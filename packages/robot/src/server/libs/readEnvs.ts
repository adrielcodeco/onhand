import fs from 'fs'
import path from 'path'

export const readEnvs = async (cwd: string) => {
  const envPath = path.resolve(cwd, 'onhand.envs.json')
  const envs: Array<{
    name: string
    profileName: string
    region: string
    canBePromotedTo: string[]
  }> = []
  if (fs.existsSync(envPath)) {
    const envsContent = fs.readFileSync(envPath, { encoding: 'utf8' })
    const {
      profileName: defaultProfileName,
      region: defaultRegion,
      envs: _envs,
    } = JSON.parse(envsContent)
    for (const { name, profileName, region, canBePromotedTo } of _envs) {
      envs.push({
        name,
        profileName: profileName ?? defaultProfileName,
        region: region ?? defaultRegion,
        canBePromotedTo,
      })
    }
  }
  return envs
}
