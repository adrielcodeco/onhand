import { Primitive } from '@onhand/utils'

export function mergeObject<T = any> (toObject: T, obj: MergeObject<T>): T {
  for (const key in obj) {
    if (key === '*') {
      for (const toKey in toObject) {
        merge(toObject, toKey, obj[key])
      }
    } else {
      merge(toObject, key, Reflect.get(obj, key))
    }
  }
  return toObject
}

function merge (toObject: any, key: string, obj: any) {
  switch (typeof obj) {
    case 'object':
      if (Array.isArray(obj)) {
        if (!(key in toObject)) {
          toObject[key] = []
        }
        if (Array.isArray(toObject[key])) {
          toObject[key] = toObject[key].concat(obj)
        } else {
          toObject[key] = obj
        }
      } else {
        if (!(key in toObject)) {
          toObject[key] = {}
        }
        mergeObject(toObject[key], obj)
      }
      break
    default:
      toObject[key] = obj
      break
  }
  return toObject
}

type MergeObjectOrFallback<T> = T extends
| ((...args: any[]) => any)
| Primitive
| any[]
  ? T
  : MergeObject<T>

export type MergeWillCard<P = any> = {
  '*'?: P & MergeWillCard<P>
}

export type MergeObject<T> = {
  [K in keyof T]?: MergeObjectOrFallback<T[K]>
} & MergeWillCard
