import { ACGroup } from '@onhand/accesscontrol'

export const IAccessControlRepositoryToken = Symbol.for(
  'IAccessControlRepository',
)

export interface IAccessControlRepository {
  listGrants: () => Promise<ACGroup[]>
}
