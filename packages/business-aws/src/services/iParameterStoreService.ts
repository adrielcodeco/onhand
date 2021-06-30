export const IParameterStoreServiceToken = Symbol.for('IParameterStoreService')

export interface IParameterStoreService {
  has: (key: string) => boolean
  get: (
    ...keys: string[]
  ) => Promise<Array<string | string[]> | string | string[]>
  getOne: (key: string, propagateError?: boolean) => Promise<string | string[]>
  getAll: (
    keys: string[],
    propagateError?: boolean,
  ) => Promise<Array<{ name: string, value: string | string[] }>>
}
