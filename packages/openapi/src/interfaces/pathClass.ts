import { OpenAPIV3 } from 'openapi-types'

export interface PathClass {
  description: string
  summary: string
  servers?: OpenAPIV3.ServerObject
}
