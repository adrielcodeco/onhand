import 'reflect-metadata'
import { injectable } from 'inversify'

const metadataKey = Symbol.for('ioc.metadata')

const decorator = (kind: string) => {
  return function (target: any) {
    Reflect.defineMetadata(metadataKey, { kind }, target)
    const fn = injectable()
    return fn(target)
  }
}

const is = (target: any, kind: string) => {
  const metadata = Reflect.getMetadata(metadataKey, target)
  return metadata?.kind === kind
}

export function usecase () {
  return decorator('usecase')
}

export const isUsecase = (target: any) => {
  return is(target, 'usecase')
}
