import { DyModel } from '#/models/dyModel'
import { ExactlySameKeys } from '@onhand/utils'

type Model = { name: string, roles: string[] }

const schema: ExactlySameKeys<Model> = {
  name: {
    type: String,
    hashKey: true,
  },
  roles: {
    type: Array,
    schema: [String],
  },
}

export const ACGroupModelProvider = DyModel<Model>(
  `onhand${process.env.STAGE ? '_' : ''}${process.env.STAGE ?? ''}_ACGroup`,
  schema,
  {},
  '1',
)
