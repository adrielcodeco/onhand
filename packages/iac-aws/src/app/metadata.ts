import { OpenAPIV3 } from 'openapi-types'
import { Config } from './config'

export interface AppMetadata {
  packageVersion: string
  localServerPort?: string
}

export interface ContextMetadata {
  cwd: string
  stage: string
  verbose?: boolean
  ignoreErrors?: boolean
}

export interface IaCMetadata {
  awsProfile: string
  awsRegion: string
  awsAccount: string
}

export interface Metadata {
  app?: AppMetadata
  context?: ContextMetadata
  iac?: IaCMetadata
  openApi?: OpenAPIV3.Document
  config?: Config
}
