import { Ctor } from '@onhand/utils'
import { manageFunctionMetadata } from '#/metadata/functionMetadata'

export function Authenticated (name: string | null, ...permissions: string[]) {
  return (constructor: Ctor<any>) => {
    return manageFunctionMetadata(constructor)
      .merge({
        operation: {
          security: [{ [name ?? 'default']: permissions }],
        },
      })
      .end()
  }
}
