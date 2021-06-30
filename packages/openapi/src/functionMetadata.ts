import 'reflect-metadata'
import { mergeWith, isArray } from 'lodash'

const symbolOnhandAPIFunctionMetadata = Symbol.for(
  'onhand-api-function-metadata',
)

export type FunctionMetadata = {
  functionFileAbsolutePath: string
  provider: string
  className: string
  handlerName: string
}

export function manageFunctionMetadata<FM extends FunctionMetadata> (func: any) {
  const getMetadata: () => FM = () =>
    Reflect.getMetadata(symbolOnhandAPIFunctionMetadata, func)
  const _ = {
    get: (): FM => {
      return getMetadata()
    },
    set: (metadata: FM) => {
      Reflect.defineMetadata(symbolOnhandAPIFunctionMetadata, metadata, func)
      return _
    },
    merge: (metadataPart: Partial<FM>) => {
      Reflect.defineMetadata(
        symbolOnhandAPIFunctionMetadata,
        mergeWith(
          getMetadata() ?? {},
          metadataPart ?? {},
          (objValue: any, srcValue: any) => {
            if (isArray(objValue)) {
              return objValue.concat(srcValue)
            }
            return undefined
          },
        ),
        func,
      )
      return _
    },
    change: (change: (metadata: FM) => FM) => {
      Reflect.defineMetadata(
        symbolOnhandAPIFunctionMetadata,
        change(getMetadata()),
        func,
      )
      return _
    },
    changeKey: <P extends keyof FM, T extends FM[P]>(key: P, value: T) => {
      const metadata = getMetadata()
      if (!metadata) {
        throw new Error('metadata not exits')
      }
      metadata[key] = value
      Reflect.defineMetadata(symbolOnhandAPIFunctionMetadata, metadata, func)
      return _
    },
    delete: <P extends keyof FM>(key: P) => {
      const metadata = getMetadata()
      if (!metadata) {
        throw new Error('metadata not exits')
      }
      Reflect.deleteProperty(metadata, key)
      Reflect.defineMetadata(symbolOnhandAPIFunctionMetadata, metadata, func)
      return _
    },
    end: () => func,
  }
  return _
}
