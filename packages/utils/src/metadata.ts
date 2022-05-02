import 'reflect-metadata'
import { mergeObject, MergeObject } from '#/mergeObject'

export function manageMetadata<M = any> (target: any, metadataKey: any) {
  const getMetadata: () => M = () => Reflect.getMetadata(metadataKey, target)
  const _ = {
    get: (): M => {
      return getMetadata()
    },
    set: (metadata: M) => {
      Reflect.defineMetadata(metadataKey, metadata, target)
      return _
    },
    merge: (metadataPart: MergeObject<M>) => {
      Reflect.defineMetadata(
        metadataKey,
        mergeObject<M>(getMetadata() ?? ({} as any), metadataPart ?? {}),
        target,
      )
      return _
    },
    change: (change: (metadata: M) => M) => {
      Reflect.defineMetadata(metadataKey, change(getMetadata()), target)
      return _
    },
    changeKey: <P extends keyof M, T extends M[P]>(key: P, value: T) => {
      const metadata = getMetadata()
      if (!metadata) {
        throw new Error('metadata not exits')
      }
      metadata[key] = value
      Reflect.defineMetadata(metadataKey, metadata, target)
      return _
    },
    deleteKey: <P extends keyof M>(key: P) => {
      const metadata = getMetadata()
      if (!metadata) {
        throw new Error('metadata not exits')
      }
      Reflect.deleteProperty(metadata as any, key)
      Reflect.defineMetadata(metadataKey, metadata, target)
      return _
    },
    delete: () => {
      Reflect.deleteMetadata(metadataKey, target)
      return _
    },
    end: () => target,
  }
  return _
}
