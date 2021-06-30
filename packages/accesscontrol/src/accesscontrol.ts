import { set, get, unset } from 'lodash'
import {
  ACEffect,
  ACAction,
  ACPossession,
  actionParse,
  effectParse,
  possessionParse,
  ActionType,
  PossessionType,
} from '#/enums'
import { ACRule } from '#/rule'
import { ACGroup, isGroup } from './group'
import { ACRole, isRole } from './role'

export class AccessControl {
  private readonly grants: ACGroup[]

  constructor (grants: ACGroup[])
  constructor (grants: ACRole[])
  constructor (grants: string[])
  constructor (grants: string[] | ACGroup[] | ACRole[]) {
    if (!Array.isArray(grants)) {
      throw new Error('grants is not an array')
    }
    if (!grants.length) {
      throw new Error('grants cannot be empty')
    }
    if (typeof grants[0] === 'string') {
      this.grants = this.parseGrants(grants as string[])
    } else {
      if (isRole(grants[0])) {
        const group: ACGroup = { name: '*', roles: grants as ACRole[] }
        this.grants = this.deepFreeze([group])
      } else if (isGroup(grants[0])) {
        this.grants = this.deepFreeze(grants as ACGroup[])
      } else {
        throw new Error('invalid grants')
      }
    }
  }

  check (rules: ACRule[]) {
    return {
      for: (roleOrGroup: string, owner = false) => {
        let groupRules: ACRule[] = []
        const group = this.grants.find(i => i.name === roleOrGroup)
        if (group) {
          for (const role of group.roles) {
            groupRules = groupRules.concat(role.rules)
          }
        } else {
          for (const _group of this.grants) {
            const role = _group.roles.find(r => r.name === roleOrGroup)
            if (role) {
              groupRules = groupRules.concat(role.rules)
              break
            }
          }
        }
        let granted = true
        for (const rule of rules) {
          granted &&= this.checkGrants(
            groupRules,
            rule.resource,
            rule.action,
            rule.possession,
            owner,
          )
        }
        return granted
      },
    }
  }

  as (roleOrGroup: string) {
    let groupRules: ACRule[] = []
    const group = this.grants.find(i => i.name === roleOrGroup)
    if (group) {
      for (const role of group.roles) {
        groupRules = groupRules.concat(role.rules)
      }
    } else {
      for (const _group of this.grants) {
        const role = _group.roles.find(r => r.name === roleOrGroup)
        if (role) {
          groupRules = groupRules.concat(role.rules)
          break
        }
      }
    }
    return {
      canI: () => this.can(groupRules),
      filterMyData: (data: any) => this.filter(groupRules, data),
    }
  }

  private can (rules: ACRule[]) {
    return {
      createMyOwn: (resource: string) => {
        return this.checkGrants(
          rules,
          resource,
          ACAction.create,
          ACPossession.own,
          true,
        )
      },
      createAny: (resource: string) => {
        return this.checkGrants(
          rules,
          resource,
          ACAction.create,
          ACPossession.any,
          false,
        )
      },
      readMyOwn: (resource: string) => {
        return this.checkGrants(
          rules,
          resource,
          ACAction.read,
          ACPossession.own,
          true,
        )
      },
      readAny: (resource: string) => {
        return this.checkGrants(
          rules,
          resource,
          ACAction.read,
          ACPossession.any,
          false,
        )
      },
      updateMyOwn: (resource: string) => {
        return this.checkGrants(
          rules,
          resource,
          ACAction.update,
          ACPossession.own,
          true,
        )
      },
      updateAny: (resource: string) => {
        return this.checkGrants(
          rules,
          resource,
          ACAction.update,
          ACPossession.any,
          false,
        )
      },
      deleteMyOwn: (resource: string) => {
        return this.checkGrants(
          rules,
          resource,
          ACAction.delete,
          ACPossession.own,
          true,
        )
      },
      deleteAny: (resource: string) => {
        return this.checkGrants(
          rules,
          resource,
          ACAction.delete,
          ACPossession.any,
          false,
        )
      },
    }
  }

  private checkGrants (
    rules: ACRule[],
    resource: string,
    action: ActionType,
    possession: PossessionType,
    owner: boolean,
  ) {
    const allowRule = rules.find(
      r =>
        r.resource === resource &&
        r.effect === ACEffect.allow &&
        r.action === action,
    )
    const dennyRule = rules.find(
      r =>
        r.resource === resource &&
        r.effect === ACEffect.denny &&
        r.action === action,
    )
    return !!allowRule && !dennyRule && (possession === 'any' || owner)
  }

  private filter (rules: ACRule[], data: any) {
    const deepFilter = (
      resource: string,
      action: ACAction,
      possession: ACPossession,
    ) => {
      const rule = rules.find(
        r =>
          r.resource === resource &&
          r.effect === ACEffect.allow &&
          r.action === action &&
          r.possession === possession,
      )
      if (!rule?.attributes.length) {
        return data
      }
      let result = {}
      if (rule?.attributes.includes('*')) {
        result = data
      } else {
        for (const attr of rule.attributes.filter(a => !a.startsWith('!'))) {
          set(result, attr, get(data, attr))
        }
      }
      for (const attr of rule.attributes.filter(a => a.startsWith('!'))) {
        unset(result, attr)
      }
      return result
    }
    return {
      when: () => ({
        iReadMyOwn: (resource: string) => {
          return deepFilter(resource, ACAction.read, ACPossession.own)
        },
        iReadAny: (resource: string) => {
          return deepFilter(resource, ACAction.read, ACPossession.any)
        },
        iUpdateMyOwn: (resource: string) => {
          return deepFilter(resource, ACAction.update, ACPossession.own)
        },
        iUpdateAny: (resource: string) => {
          return deepFilter(resource, ACAction.update, ACPossession.any)
        },
      }),
    }
  }

  private parseGrants (grants: string[]): ACGroup[] {
    const result: ACGroup[] = []
    for (const grant of grants) {
      const [
        group,
        role,
        resource,
        effect,
        action,
        possession,
        ...attributes
      ] = grant.split(':')
      const roleEntity: ACRole = {
        name: role,
        rules: [
          {
            effect: effectParse(effect),
            action: actionParse(action),
            possession: possessionParse(possession),
            resource,
            attributes,
          },
        ],
      }
      const existingGroup = result.find(g => g.name === group)
      if (existingGroup) {
        existingGroup.roles.push(roleEntity)
      } else {
        result.push({
          name: group,
          roles: [roleEntity],
        })
      }
    }
    return result
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private deepFreeze<T extends object>(obj: T): T {
    const propNames = Object.getOwnPropertyNames(obj)
    for (const name of propNames) {
      const prop = Reflect.get(obj, name)
      if (typeof prop === 'object' && prop !== null) {
        this.deepFreeze(prop)
      }
    }
    return Object.freeze(obj)
  }
}
