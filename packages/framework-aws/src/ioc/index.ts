import { container } from '@onhand/business/#/ioc/container'
import { buildProviderModule } from 'inversify-binding-decorators'

export * from './commonModule'
export * from './repositoryModule'
export * from './serviceModule'
export * from './usecaseModule'

container.load(buildProviderModule())
