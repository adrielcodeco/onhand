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
  memorySize?: number
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
    const { policies, memorySize } = extra ?? {}
    const handler = `index.${handlerName}`
    const operationName = operationId ?? className
    const authorizer =
      (security ?? [])
        .map((sec: any) => Object.keys(sec).shift())
        .filter(Boolean)
        .shift() ?? ''
    functions.push({
      policies: policies ?? [],
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
      memorySize: memorySize ?? 128,
    })
  }
  for (const authorizerMetadata of metadata.authorizers ?? []) {
    const {
      className,
      handlerName,
      functionMetadata: { extra },
    } = authorizerMetadata
    const { authorizerName, policies, memorySize } = extra ?? {}
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
      authorizer: authorizerName ?? 'default',
      isAuthorizer: true,
      memorySize: memorySize ?? 128,
    })
  }
  return functions
}
