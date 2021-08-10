import { inject } from 'inversify'
import { UseCase } from '@onhand/business/#/useCase'
import { usecase } from '@onhand/business/#/ioc/decorators'
import { AccessControl, ACRule } from '@onhand/accesscontrol'
import {
  IAccessControlRepository,
  IAccessControlRepositoryToken,
} from '#/repositories/iAccessControlRepository'
import {
  IInMemoryCacheService,
  IInMemoryCacheServiceToken,
} from '@onhand/business/#/services/iInMemoryCacheService'

type I = { role: string, rules: ACRule[], ownership?: () => Promise<boolean> }
type O = boolean

@usecase()
export class CheckGrantUseCase extends UseCase<I, O> {
  @inject(IAccessControlRepositoryToken)
  private readonly accessControlRepository!: IAccessControlRepository

  @inject(IInMemoryCacheServiceToken)
  private readonly inMemoryCacheService!: IInMemoryCacheService

  async exec (input: I): Promise<O> {
    const { role, rules, ownership } = input
    const accessControl = await this.inMemoryCacheService.fetch(
      'accesscontrol-instance',
      async () => {
        const grants = await this.accessControlRepository.listGrants()
        if (!grants.length) {
          grants.push({
            name: '*',
            roles: [
              {
                name: '*',
                rules: [],
              },
            ],
          })
        }
        const accessControl = new AccessControl(grants)
        return accessControl
      },
    )
    const owner = !!ownership && (await ownership())
    return accessControl.check(rules).for(role, owner)
  }
}
