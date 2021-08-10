import { repository } from '@onhand/framework/#/ioc/decorators'
import { ACGroup, ACRole, rule } from '@onhand/accesscontrol'
import { IAccessControlRepository } from '@onhand/business-aws/#/repositories'
import { ACGroupModelProvider } from '#/models/acGroups'
import { ACRoleModelProvider } from '#/models/acRoles'

@repository()
export class AccessControlRepository implements IAccessControlRepository {
  private readonly ACGroupModel = ACGroupModelProvider()
  private readonly ACRoleModel = ACRoleModelProvider()

  async listGrants (): Promise<ACGroup[]> {
    const groups = await this.ACGroupModel.scan().exec()
    const roles = await this.ACRoleModel.scan()
      .exec()
      .then(roles =>
        roles.map(r => {
          const rules = r.rules.map(rule)
          const role: ACRole = {
            name: r.name,
            rules,
          }
          return role
        }),
      )
    const result: ACGroup[] = []
    for (const group of groups) {
      result.push({
        name: group.name,
        roles: roles.filter(r => group.roles.includes(r.name)),
      })
    }
    for (const role of roles) {
      result.push({
        name: role.name,
        roles: [role],
      })
    }
    return result
  }
}
