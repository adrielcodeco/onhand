import { ContainerModule, interfaces } from 'inversify'
import { container } from '@onhand/business/#/ioc/container'
import { AWSFunctionContainerContext } from '#/infrastructure/awsFunctionContainerContext'
import {
  AWSFunctionContainerContextOptions,
  AWSFunctionContainerContextOptionsToken,
  AWSFunctionContainerContextOptionsDefault,
} from '#/infrastructure/awsFunctionContainerContextOptions'
import { AWSFunctionHandleContext } from '#/infrastructure/awsFunctionHandleContext'
import {
  AWSFunctionHandleContextOptions,
  AWSFunctionHandleContextOptionsDefault,
  AWSFunctionHandleContextOptionsToken,
} from '#/infrastructure/awsFunctionHandleContextOptions'

const commonModule = new ContainerModule(
  (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind(AWSFunctionContainerContext).toSelf().inTransientScope()
    bind(AWSFunctionHandleContext).toSelf().inTransientScope()
    bind<AWSFunctionContainerContextOptions>(
      AWSFunctionContainerContextOptionsToken,
    ).toConstantValue(AWSFunctionContainerContextOptionsDefault)
    bind<AWSFunctionHandleContextOptions>(
      AWSFunctionHandleContextOptionsToken,
    ).toConstantValue(AWSFunctionHandleContextOptionsDefault)
  },
)

container.load(commonModule)

export { commonModule }
