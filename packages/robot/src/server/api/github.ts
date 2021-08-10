import Axios from 'axios'
import moment from 'moment'
import { Request, Response, NextFunction } from 'express'
import { API } from '#/server/iApi'

// TODO: add application logo to github app oath on github (https://github.com/settings/applications/1678930)
const clientId = '0f5cf8c7ef21c34b04d8'

export const getDeviceCode: API = {
  method: 'get',
  path: '/github/device-code',
  controller: async (req: Request, res: Response, next: NextFunction) => {
    const data = await Axios.post(
      'https://github.com/login/device/code',
      { client_id: clientId, scope: 'repo' },
      {
        headers: {
          Accept: 'application/json',
        },
        validateStatus: (status: number) => true,
      },
    ).then(response => {
      console.log(response.data)
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { device_code, user_code, verification_uri, expires_in } =
        response.data
      const expiresIn = moment().add(expires_in, 'seconds')
      return {
        deviceCode: device_code,
        userCode: user_code,
        verificationUri: verification_uri,
        expiresIn,
      }
    })
    res.json(data)
  },
}

export const getAccessCode: API = {
  method: 'get',
  path: '/github/access-code',
  controller: async (req: Request, res: Response, next: NextFunction) => {
    const { deviceCode } = req.query
    const data = await Axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      },
      {
        headers: {
          Accept: 'application/json',
        },
        validateStatus: (status: number) => true,
      },
    ).then(response => {
      console.log(response.data)
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { access_token } = response.data
      return access_token
    })
    res.json(data)
  },
}
