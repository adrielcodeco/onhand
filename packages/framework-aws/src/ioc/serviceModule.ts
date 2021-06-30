import { ContainerModule, interfaces } from 'inversify'
import { container } from '@onhand/business/#/ioc/container'
import {
  ICognitoService,
  ICognitoServiceToken,
} from '@onhand/business-aws/#/services/iCognitoService'
import { CognitoService } from '#/services/cognitoService'
import {
  IParameterStoreService,
  IParameterStoreServiceToken,
} from '@onhand/business-aws/#/services/iParameterStoreService'
import { ParameterStoreService } from '#/services/parameterStoreService'

const serviceModule = new ContainerModule(
  (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
    bind<ICognitoService>(ICognitoServiceToken)
      .to(CognitoService)
      .inSingletonScope()
    bind<IParameterStoreService>(IParameterStoreServiceToken)
      .to(ParameterStoreService)
      .inSingletonScope()
  },
)

container.load(serviceModule)

export { serviceModule }
