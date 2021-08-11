import { DyModel } from '@onhand/framework-aws/#/models'

export type Timeline = {
  /**
   * composite id {type}#{name}
   */
  id: string
  name: string
  type: string
}

const schema = () => ({
  id: {
    type: String,
    hashKey: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
})

export const TimelineModelProvider = DyModel<Timeline>(
  `onhand${process.env.STAGE ? '_' : ''}${process.env.STAGE ?? ''}_Timeline`,
  schema,
  {},
  '1',
)
