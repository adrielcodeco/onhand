import { ContainerModule, interfaces } from 'inversify'
import { container } from '@onhand/business/#/ioc/container'
import {
  IInMemoryCacheService,
  IInMemoryCacheServiceToken,
} from '@onhand/business/#/services/iInMemoryCacheService'
import { InMemoryCacheService } from '#/services/inMemoryCacheService'
import {
  ISessionService,
  ISessionServiceToken,
} from '@onhand/business/#/services/iSessionService'
import { SessionService } from '#/services/sessionService'

const serviceModule = new ContainerModule(
  (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind<IInMemoryCacheService>(IInMemoryCacheServiceToken)
      .to(InMemoryCacheService)
      .inSingletonScope()
    bind<ISessionService>(ISessionServiceToken)
      .to(SessionService)
      .inSingletonScope()
  },
)

container.load(serviceModule)

export { serviceModule }
