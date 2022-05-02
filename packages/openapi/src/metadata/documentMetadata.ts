import 'reflect-metadata'
import { OpenAPIV3 } from 'openapi-types'
import { manageMetadata } from '@onhand/utils'

const symbolOnhandAPIDocumentMetadata = Symbol.for(
  'onhand-api-document-metadata',
)

export type DocumentMetadata = {
  documentFileAbsolutePath: string
  openApi: Partial<OpenAPIV3.Document>
  handlersDirectoryPath: string
  extra: any
}

export function manageDocumentMetadata<M extends DocumentMetadata> (
  target: any,
) {
  return manageMetadata<M>(target, symbolOnhandAPIDocumentMetadata)
}
