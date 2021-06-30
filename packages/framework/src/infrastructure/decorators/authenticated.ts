import { Authenticated as authenticated } from '@onhand/openapi'
import { ACRule, ACAction, ACPossession } from '@onhand/accesscontrol'

type Constructor = { new (...args: any[]): any }

export function Authenticated (...permissions: ACRule[]) {
  return (constructor: Constructor): Constructor => {
    if (!permissions?.length) {
      try {
        const instance = Reflect.construct(constructor, [])
        permissions = instance.permissions
      } finally {
        // does nothing
      }
    }
    constructor = authenticated(
      null,
      ...(permissions ?? []).map(
        p =>
          `${p.effect}:${p.action ? ACAction[p.action] : ''}:${
            ACPossession[p.possession]
          }:${p.resource}${
            !p.attributes ||
            (p.attributes.length === 1 && p.attributes[0] === '*')
              ? ''
              : `:${p.attributes.join(',')}`
          }`,
      ),
    )(constructor)
    return class extends constructor {
      authenticated = true
      permissions = permissions
    }
  }
}
