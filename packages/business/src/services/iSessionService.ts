export const ISessionServiceToken = Symbol.for('ISessionService')

export interface ISessionService {
  get: <T>(key: string | symbol) => T
  set: <T>(key: string | symbol, value: T) => void
}
