import NodeCache from 'node-cache'
import { TYPES } from '@onhand/business/#/ioc/types'
import { container } from '@onhand/business/#/ioc/container'
import * as CACHE from '@onhand/business-aws/#/consts/cache'

type Constructor<T> = { new (...args: any[]): T }

export function loadSSM (
  ...params: string[]
): (constructor: Constructor<any>) => void {
  const nodeCache = container.get<NodeCache>(TYPES.NodeCache)
  if (!nodeCache.has(CACHE.parameterStore)) {
    nodeCache.set(CACHE.parameterStore, [])
  }
  const ssm = nodeCache.get<string[]>(CACHE.parameterStore)!
  params.forEach(p => !ssm.includes(p) && ssm.push(p))
  nodeCache.set(CACHE.parameterStore, ssm)
  return (constructor: Constructor<any>) => {
    return constructor
  }
}
