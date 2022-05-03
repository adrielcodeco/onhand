import 'reflect-metadata'
import { mergeObject, MergeObject } from '#/mergeObject'
import { assert } from 'console'

export function manageMetadata<M = any, T = any> (target: T, metadataKey: any) {
  if (target) {
    assert(
      typeof target === 'object',
      `target must be an object, got: ${typeof target}`,
    )
  }
  const getMetadata: () => M = () =>
    Reflect.getMetadata(metadataKey, target as any)
  const _ = {
    get: (): M => {
      return getMetadata()
    },
    set: (metadata: M) => {
      Reflect.defineMetadata(metadataKey, metadata, target as any)
      return _
    },
    merge: (metadataPart: MergeObject<M>) => {
      Reflect.defineMetadata(
        metadataKey,
        mergeObject<M>(getMetadata() ?? ({} as any), metadataPart ?? {}),
        target as any,
      )
      return _
    },
    change: (change: (metadata: M) => M) => {
      Reflect.defineMetadata(metadataKey, change(getMetadata()), target as any)
      return _
    },
    changeKey: <P extends keyof M, T extends M[P]>(key: P, value: T) => {
      const metadata = getMetadata()
      if (!metadata) {
        throw new Error('metadata not exits')
      }
      metadata[key] = value
      Reflect.defineMetadata(metadataKey, metadata, target as any)
      return _
    },
    deleteKey: <P extends keyof M>(key: P) => {
      const metadata = getMetadata()
      if (!metadata) {
        throw new Error('metadata not exits')
      }
      Reflect.deleteProperty(metadata as any, key)
      Reflect.defineMetadata(metadataKey, metadata, target as any)
      return _
    },
    delete: () => {
      Reflect.deleteMetadata(metadataKey, target as any)
      return _
    },
    end: () => target,
  }
  return _
}
