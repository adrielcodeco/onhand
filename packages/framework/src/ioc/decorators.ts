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

export function service () {
  return decorator('service')
}

export const isService = (target: any) => {
  return is(target, 'service')
}

export function repository () {
  return decorator('repository')
}

export const isRepository = (target: any) => {
  return is(target, 'repository')
}
