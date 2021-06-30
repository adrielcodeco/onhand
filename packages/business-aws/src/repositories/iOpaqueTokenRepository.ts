import { OpaqueToken } from '@onhand/domain-aws'

export const IOpaqueTokenRepositoryToken = Symbol.for('IOpaqueTokenRepository')

export interface IOpaqueTokenRepository {
  find: (opaqueToken: string) => Promise<OpaqueToken | undefined>
  add: (entity: OpaqueToken) => Promise<void>
  remove: (opaqueToken: string) => Promise<void>
  purgeUserTokens: (userIdentifier: string) => Promise<void>
}
