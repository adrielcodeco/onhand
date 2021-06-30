// cSpell:ignore INMEMORY, YMDH, YYYYMMDDHH, YMDH

import moment from 'moment'
import { injectable } from 'inversify'
import { IInMemoryCacheService } from '@onhand/business/#/services/iInMemoryCacheService'
import { container } from '@onhand/business/#/ioc/container'
import { TYPES } from '@onhand/business/#/ioc/types'
import NodeCache from 'node-cache'

@injectable()
export class InMemoryCacheService implements IInMemoryCacheService {
  has (key: string): boolean {
    const cache = container.get<NodeCache>(TYPES.NodeCache)
    const timedKey = this.timedKey(key)
    return cache.has(timedKey)
  }

  get<T>(key: string): T | undefined {
    const cache = container.get<NodeCache>(TYPES.NodeCache)
    const timedKey = this.timedKey(key)
    if (!cache.has(timedKey)) {
      return undefined
    }
    const cacheKey = cache.get<string>(timedKey)!
    return cache.get<T>(cacheKey)
  }

  set<T>(key: string, value: T): void {
    const cache = container.get<NodeCache>(TYPES.NodeCache)
    const timedKey = this.timedKey(key)
    const privateKey = this.privateKey(key)
    cache.set(timedKey, privateKey)
    cache.set(privateKey, value)
  }

  async fetch<T>(key: string, func: () => Promise<T>): Promise<T> {
    const cache = container.get<NodeCache>(TYPES.NodeCache)
    const timedKey = this.timedKey(key)
    if (!cache.has(timedKey)) {
      const value = await func()
      const timedKey = this.timedKey(key)
      const privateKey = this.privateKey(key)
      cache.set(timedKey, privateKey)
      cache.set(privateKey, value)
      return value
    }
    const cacheKey = cache.get<string>(timedKey)!
    return cache.get<T>(cacheKey)!
  }

  private privateKey (key: string): string {
    return `INMEMORY_${key}`
  }

  private timedKey (key: string): string {
    // cache duration in minutes
    const cacheDurationInMinutes =
      parseInt(process.env.IN_MEMORY_CACHE_INTERVAL ?? '', 10) || 5
    // first part of the timed key formatted like YEAR MONTH DAY HOURS
    const YMDH = moment().format('YYYYMMDDHH')
    // last part of the timed key with an integer or interval of minutes
    const m = moment().minute() / cacheDurationInMinutes
    // new time key
    return `${this.privateKey(key)}_${YMDH}${Math.floor(m)}`
  }
}
