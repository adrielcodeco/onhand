import 'reflect-metadata'
import { OpenAPIV3 } from 'openapi-types'
import { HttpMethods } from '#/httpMethods'

export const symbolOnhandApiPathMetadata = Symbol.for(
  'onhand-api-path-metadata',
)
export const symbolOnhandApiPathMethodMetadata = Symbol.for(
  'onhand-api-path-method-metadata',
)
export const symbolOnhandApiPathPathMethodMetadata = Symbol.for(
  'onhand-api-path-path-metadata',
)
export const symbolOnhandApiPathAuthorizedMethodMetadata = Symbol.for(
  'onhand-api-path-authorized-metadata',
)

export function managePathMetadata (func: any) {
  const metadata: OpenAPIV3.PathsObject = Reflect.getMetadata(
    symbolOnhandApiPathMetadata,
    func,
  )
  const _ = {
    get: (): OpenAPIV3.PathsObject => {
      return metadata
    },
    set: (metadata: OpenAPIV3.PathsObject) => {
      Reflect.defineMetadata(symbolOnhandApiPathMetadata, metadata, func)
      return _
    },
    getMethod: (): string => {
      return Reflect.getMetadata(symbolOnhandApiPathMethodMetadata, func)
    },
    setMethod: (method: HttpMethods) => {
      Reflect.defineMetadata(
        symbolOnhandApiPathMethodMetadata,
        HttpMethods[method],
        func,
      )
      return _
    },
    getPath: (): string => {
      return Reflect.getMetadata(symbolOnhandApiPathPathMethodMetadata, func)
    },
    setPath: (path: string) => {
      Reflect.defineMetadata(symbolOnhandApiPathPathMethodMetadata, path, func)
      return _
    },
    getAuthorized: (): { name: string, permissions: string[] } => {
      return Reflect.getMetadata(
        symbolOnhandApiPathAuthorizedMethodMetadata,
        func,
      )
    },
    setAuthorized: (authorized: { name: string, permissions: string[] }) => {
      Reflect.defineMetadata(
        symbolOnhandApiPathAuthorizedMethodMetadata,
        authorized,
        func,
      )
      return _
    },
    change: (
      change: (metadata: OpenAPIV3.PathsObject) => OpenAPIV3.PathsObject,
    ) => {
      Reflect.defineMetadata(
        symbolOnhandApiPathMetadata,
        change(metadata),
        func,
      )
      return _
    },
    changeKey: <
      P extends keyof OpenAPIV3.PathsObject,
      T extends OpenAPIV3.PathsObject[P]
    >(
      key: P,
      value: T,
    ) => {
      if (!metadata) {
        throw new Error('metadata not exits')
      }
      metadata[key] = value
      Reflect.defineMetadata(symbolOnhandApiPathMetadata, metadata, func)
      return _
    },
    delete: <P extends keyof OpenAPIV3.PathsObject>(key: P) => {
      if (!metadata) {
        throw new Error('metadata not exits')
      }
      Reflect.deleteProperty(metadata, key)
      Reflect.defineMetadata(symbolOnhandApiPathMetadata, metadata, func)
      return _
    },
    end: () => func,
  }
  return _
}
