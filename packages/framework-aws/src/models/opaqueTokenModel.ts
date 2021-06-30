import { Document } from 'dynamoose/dist/Document'
import { ExactlySameKeys } from '@onhand/utils'
import { OpaqueToken } from '@onhand/domain-aws'
import { DyModel } from './dyModel'

const schema: ExactlySameKeys<OpaqueToken> = {
  opaqueToken: {
    type: String,
    hashKey: true,
  },
  cognitoToken: String,
  userIdentifier: {
    type: String,
    index: {
      name: 'userIdentifier-index',
      global: true,
    },
  },
  role: String,
  scope: String,
}

type OpaqueTokenDocument = Document & OpaqueToken

export const OpaqueTokenModelProvider = DyModel<OpaqueTokenDocument>(
  'OpaqueTokens',
  schema,
  {},
  '1',
)
