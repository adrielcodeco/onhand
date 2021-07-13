/* eslint-disable @typescript-eslint/no-var-requires */
import { OpenAPI, OpenAPIClass } from '@onhand/openapi'
import { OpenAPIV3 } from 'openapi-types'
const packageJson = require('../../package.json')

@OpenAPI('./functions')
export class OpenAPIDocument implements OpenAPIClass {
  info: OpenAPIV3.InfoObject = {
    title: 'MIF API',
    version: packageJson.version,
    description: 'Meu Indicador Financeiro - API',
  }

  servers?: OpenAPIV3.ServerObject[] = [
    {
      url: 'https://meuindicador.com',
    },
  ]

  tags?: OpenAPIV3.TagObject[] = undefined

  externalDocs?: OpenAPIV3.ExternalDocumentationObject = undefined
}
