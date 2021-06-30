import 'reflect-metadata'
import { OpenAPIV3 } from 'openapi-types'

export const symbolOnhandApiDocumentMetadata = Symbol.for(
  'onhand-api-document-metadata',
)
export const symbolOnhandApiPathsDirMetadata = Symbol.for(
  'onhand-api-pathsDir-metadata',
)

export function manageDocumentMetadata (func: any) {
  const metadata: OpenAPIV3.Document = Reflect.getMetadata(
    symbolOnhandApiDocumentMetadata,
    func,
  )
  const _ = {
    get: (): OpenAPIV3.Document => {
      return metadata
    },
    set: (metadata: OpenAPIV3.Document) => {
      Reflect.defineMetadata(symbolOnhandApiDocumentMetadata, metadata, func)
      return _
    },
    getPathsDir: (): string => {
      return Reflect.getMetadata(symbolOnhandApiPathsDirMetadata, func)
    },
    setPathsDir: (pathsDir: string) => {
      Reflect.defineMetadata(symbolOnhandApiPathsDirMetadata, pathsDir, func)
      return _
    },
    change: (change: (metadata: OpenAPIV3.Document) => OpenAPIV3.Document) => {
      Reflect.defineMetadata(
        symbolOnhandApiDocumentMetadata,
        change(metadata),
        func,
      )
      return _
    },
    changeKey: <
      P extends keyof OpenAPIV3.Document,
      T extends OpenAPIV3.Document[P]
    >(
      key: P,
      value: T,
    ) => {
      if (!metadata) {
        throw new Error('metadata not exits')
      }
      metadata[key] = value
      Reflect.defineMetadata(symbolOnhandApiDocumentMetadata, metadata, func)
      return _
    },
    delete: <P extends keyof OpenAPIV3.Document>(key: P) => {
      if (!metadata) {
        throw new Error('metadata not exits')
      }
      Reflect.deleteProperty(metadata, key)
      Reflect.defineMetadata(symbolOnhandApiDocumentMetadata, metadata, func)
      return _
    },
    end: () => func,
  }
  return _
}
