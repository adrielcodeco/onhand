import NodeCache from 'node-cache'
import { chunk, concat } from 'lodash'
import { container } from '@onhand/business/#/ioc/container'
import { TYPES } from '@onhand/business/#/ioc/types'
import * as CACHE from '@onhand/business-aws/#/consts/cache'
import {
  IInMemoryCacheService,
  IInMemoryCacheServiceToken,
} from '@onhand/business/#/services/iInMemoryCacheService'
import {
  IParameterStoreService,
  IParameterStoreServiceToken,
} from '@onhand/business-aws/#/services/iParameterStoreService'

type Parameters = Array<{ name: string, value: string | string[] }>

export async function initSSM (): Promise<void> {
  const parameterStoreService = container.get<IParameterStoreService>(
    IParameterStoreServiceToken,
  )
  const inMemoryCacheService = container.get<IInMemoryCacheService>(
    IInMemoryCacheServiceToken,
  )
  const cache = container.get<NodeCache>(TYPES.NodeCache)
  const fetchParams = async (): Promise<Parameters> => {
    const parameters: string[] = cache.get<string[]>(CACHE.parameterStore) ?? []
    const groups = chunk(parameters, 10)
    let result: Parameters = []
    for (const group of groups) {
      const params = await parameterStoreService.getAll(group)
      result = concat(result, params)
    }
    return result
  }
  let ssm = inMemoryCacheService.get<Parameters>('ssm')
  if (!ssm) {
    ssm = await fetchParams()
    inMemoryCacheService.set('ssm', ssm)
    for (const param of ssm) {
      if (container.isBound(param.name)) {
        container.unbind(param.name)
      }
      container.bind(param.name).toConstantValue(param.value)
    }
  }
}
