import 'reflect-metadata'
import { container } from '@onhand/business/#/ioc/container'
import { buildProviderModule } from 'inversify-binding-decorators'

export * from './commonModule'
export * from './serviceModule'
export * from './sessionModule'

container.load(buildProviderModule())
