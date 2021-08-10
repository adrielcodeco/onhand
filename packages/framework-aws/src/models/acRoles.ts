import { DyModel } from '#/models/dyModel'
import { ExactlySameKeys } from '@onhand/utils'
import { ACRole } from '@onhand/accesscontrol'

const schema: () => ExactlySameKeys<ACRole> = () => ({
  name: {
    type: String,
    hashKey: true,
  },
  rules: {
    type: Array,
    schema: [
      {
        type: Object,
        schema: {
          effect: String,
          resource: String,
          action: String,
          possession: String,
          attributes: {
            type: Array,
            schema: [String],
          },
        },
      },
    ],
  },
})

export const ACRoleModelProvider = DyModel<ACRole>(
  `onhand${process.env.STAGE ? '_' : ''}${process.env.STAGE ?? ''}_ACRole`,
  schema,
  {},
  '1',
)
