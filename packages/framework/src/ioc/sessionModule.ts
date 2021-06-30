import { ContainerModule, interfaces } from 'inversify'
import { container } from '@onhand/business/#/ioc/container'
import {
  ISessionService,
  ISessionServiceToken,
} from '@onhand/business/#/services/iSessionService'
import { TYPES } from '@onhand/business/#/ioc/types'

const sessionModule = new ContainerModule(
  (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    const sessions = [
      TYPES.RequestId,
      TYPES.UserIdentifier,
      TYPES.UserRole,
      TYPES.UserScope,
      TYPES.UserDeviceId,
    ]
    for (const session of sessions) {
      bind(session).toDynamicValue(context => {
        const sessionService = context.container.get<ISessionService>(
          ISessionServiceToken,
        )
        return sessionService.get(session)
      })
    }
  },
)

container.load(sessionModule)

export { sessionModule }
