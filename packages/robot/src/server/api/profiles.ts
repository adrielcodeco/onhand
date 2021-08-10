import execa from 'execa'
import { loadSharedConfigFiles } from '@aws-sdk/shared-ini-file-loader'
import { Request, Response, NextFunction } from 'express'
import { API } from '#/server/iApi'

export const listProfiles: API = {
  method: 'get',
  path: '/profiles',
  controller: async (req: Request, res: Response, next: NextFunction) => {
    const { configFile, credentialsFile } = await loadSharedConfigFiles()
    const profiles: any[] = []
    for (const profileName in credentialsFile) {
      profiles.push({
        profileName,
        defaultRegion: configFile[profileName]?.region ?? '',
      })
    }
    res.json(profiles)
  },
}

export const saveProfile: API = {
  method: 'post',
  path: '/profiles',
  controller: async (req: Request, res: Response, next: NextFunction) => {
    const { profileName, accessKey, secretKey, defaultRegion } = req.body
    if (!profileName || !accessKey || !secretKey || !defaultRegion) {
      res.status(422).end()
      return
    }
    const set = async (key: string, value: string) => {
      await execa('aws', [
        ' configure',
        'set',
        key,
        value,
        '--profile',
        profileName,
      ]).then(console.log)
    }
    await set('aws_access_key_id', accessKey)
    await set('aws_secret_access_key', secretKey)
    await set('region', defaultRegion)
    res.json({ success: true })
  },
}
