import { OpenAPIV3 } from 'openapi-types'

export interface OpenAPIClass {
  version?: string
  info: OpenAPIV3.InfoObject
  servers?: OpenAPIV3.ServerObject[]
  tags?: OpenAPIV3.TagObject[]
  externalDocs?: OpenAPIV3.ExternalDocumentationObject
}
