import { Policy } from '@onhand/framework-aws/#/infrastructure/apigateway/metadata/policiesMetadata'
import { Options, resourceName } from './options'
import { projectName } from '#/cdk/resources'
// import { getReleasesBucketName } from '#/cdk/resources'

export type FunctionOptions = {
  policies: Policy[]
  // bucketName: string
  fileKey: string
  operationName: string
  functionName: string
  handler: string
  description: string
  version: string
  path?: string
  method?: string
  authorizer?: string
  isAuthorizer: boolean
}

export function createFunctionsOptions (options: Options) {
  const functions: FunctionOptions[] = []
  const appName = projectName(options)
  const packageVersion = options.packageVersion ?? ''
  const metadata = options.metadata!
  for (const handlerMetadata of metadata.handlers ?? []) {
    const {
      className,
      handlerName,
      functionMetadata: {
        method,
        path,
        extra,
        operation: { description, operationId, security },
      },
    } = handlerMetadata
    const { policies } = extra ?? {}
    const handler = `index.${handlerName}`
    const operationName = operationId ?? className
    const authorizer = security
      ? ((Reflect.ownKeys(security) || [''])[0] as string)
      : ''
    functions.push({
      policies: policies,
      // bucketName: getReleasesBucketName(options),
      fileKey: `${appName}-${packageVersion}/${operationName}.zip`,
      operationName,
      functionName: resourceName(options, operationName, false, 'kebab'),
      handler: handler,
      description: description ?? operationName,
      version: options.packageVersion!,
      path,
      method,
      authorizer,
      isAuthorizer: false,
    })
  }
  for (const authorizerMetadata of metadata.authorizers ?? []) {
    const {
      className,
      handlerName,
      functionMetadata: { extra },
    } = authorizerMetadata
    const { policies } = extra ?? {}
    const handler = `index.${handlerName}`
    const operationName = className
    functions.push({
      policies: policies ?? [],
      // bucketName: getReleasesBucketName(options),
      fileKey: `${appName}-${packageVersion}/${operationName}.zip`,
      operationName,
      functionName: resourceName(options, operationName, false, 'kebab'),
      version: options.packageVersion!,
      handler: handler,
      description: `deployed on: ${new Date().toISOString()}`,
      isAuthorizer: true,
    })
  }
  return functions
}
