import { ContainerModule, interfaces } from 'inversify'
import { container } from '@onhand/business/#/ioc/container'
import { CheckGrantUseCase } from '@onhand/business-aws/#/useCases/accessControl/checkGrantUseCase'

const usecaseModule = new ContainerModule(
  (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind(CheckGrantUseCase).to(CheckGrantUseCase)
  },
)

container.load(usecaseModule)

export { usecaseModule }
