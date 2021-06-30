export const IInMemoryCacheServiceToken = Symbol.for('IInMemoryCacheService')

export interface IInMemoryCacheService {
  has: (key: string) => boolean
  get: <T>(key: string) => T | undefined
  set: <T>(key: string, value: T) => void
  fetch: <T>(key: string, func: () => Promise<T>) => Promise<T>
}
