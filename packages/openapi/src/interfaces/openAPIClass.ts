import { OpenAPIV3 } from 'openapi-types'

export type OpenAPIClass = Omit<
OpenAPIV3.Document,
'openapi' | 'paths' | 'components' | 'security'
>
