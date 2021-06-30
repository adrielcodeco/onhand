import { injectable } from 'inversify'
import { createNamespace } from 'cls-hooked'
import { ISessionService } from '@onhand/business/#/services/iSessionService'

export const session = createNamespace('onhand.session')

@injectable()
export class SessionService implements ISessionService {
  get<T>(key: string | symbol): T {
    return session.get(this.key(key))
  }

  set<T>(key: string | symbol, value: T): void {
    session.set(this.key(key), value)
  }

  private key (key: string | symbol): string {
    return typeof key === 'symbol' ? key.toString() : key
  }
}
