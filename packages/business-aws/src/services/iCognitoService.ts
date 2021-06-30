import { Profile } from '#/dto/profile'

export const ICognitoServiceToken = Symbol.for('ICognitoService')

export interface ICognitoService {
  authenticate: (
    user: string,
    pwd: string,
    scope: string,
  ) => Promise<{ token: string, userIdentifier?: string }>

  register: (profile: Profile) => Promise<Profile | undefined>

  validateToken: (
    token: string,
  ) => Promise<{ userIdentifier: string, userRole: string } | undefined>

  verifyEmailCode: (user: string, code: string) => Promise<void>
}
