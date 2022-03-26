import { Ctor } from '@onhand/utils'
import { manageFunctionMetadata } from '#/metadata'

export function Deprecated () {
  return (constructor: Ctor<any>) => {
    return manageFunctionMetadata(constructor)
      .merge({
        operation: {
          deprecated: true,
        },
      })
      .end()
  }
}
