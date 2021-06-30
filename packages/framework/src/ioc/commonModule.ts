import NodeCache from 'node-cache'
import { ContainerModule, interfaces } from 'inversify'
import { container } from '@onhand/business/#/ioc/container'
import { ILogger, LogToken } from '@onhand/business/#/modules/logger'
import { ConsoleLogger } from '#/infrastructure/logger/consoleLogger'
import { TYPES } from '@onhand/business/#/ioc/types'

const commonModule = new ContainerModule(
  (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind<ILogger>(LogToken).to(ConsoleLogger).inSingletonScope()
    bind<NodeCache>(TYPES.NodeCache).toConstantValue(new NodeCache())
  },
)

container.load(commonModule)

export { commonModule }
