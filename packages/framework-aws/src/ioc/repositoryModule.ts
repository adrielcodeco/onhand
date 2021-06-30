import { ContainerModule, interfaces } from 'inversify'
import { container } from '@onhand/business/#/ioc/container'
import {
  IAccessControlRepository,
  IAccessControlRepositoryToken,
} from '@onhand/business-aws/#/repositories/iAccessControlRepository'
import { AccessControlRepository } from '#/repositories/accessControlRepository'
import {
  IOpaqueTokenRepository,
  IOpaqueTokenRepositoryToken,
} from '@onhand/business-aws/#/repositories/iOpaqueTokenRepository'
import { OpaqueTokenRepository } from '#/repositories/opaqueTokenRepository'

const repositoryModule = new ContainerModule(
  (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind<IAccessControlRepository>(IAccessControlRepositoryToken)
      .to(AccessControlRepository)
      .inSingletonScope()
    bind<IOpaqueTokenRepository>(IOpaqueTokenRepositoryToken)
      .to(OpaqueTokenRepository)
      .inSingletonScope()
  },
)

container.load(repositoryModule)

export { repositoryModule }
