import { OpenAPIV3 } from 'openapi-types'
import {
  isHttpMethod,
  manageFunctionMetadata,
  FunctionMetadata,
} from '@onhand/openapi'
import {
  PoliciesMetadata,
  Policy,
} from '@onhand/framework-aws/#/infrastructure/apigateway/metadata/policiesMetadata'
import { as } from '@onhand/utils'
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
  const openapi = options.openApi!
  for (const routePath in openapi.paths) {
    if (!Object.prototype.hasOwnProperty.call(openapi.paths, routePath)) {
      continue
    }
    const pathItemObject: OpenAPIV3.PathItemObject = openapi.paths[routePath]!
    for (const method in pathItemObject) {
      if (!Object.prototype.hasOwnProperty.call(pathItemObject, method)) {
        continue
      }
      if (!isHttpMethod(method)) {
        continue
      }
      const operation: OpenAPIV3.OperationObject = as(pathItemObject)[method]
      const { operationId, description } = operation
      const {
        // functionFileAbsolutePath: absoluteFilePath,
        className,
        handlerName,
        policies,
      } = manageFunctionMetadata<FunctionMetadata & PoliciesMetadata>(
        operation,
      ).get()
      const handler = `index.${handlerName}`
      const operationName = operationId ?? className
      const authorizer = operation.security
        ? ((Reflect.ownKeys(operation.security) || [''])[0] as string)
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
        path: routePath,
        method,
        authorizer,
        isAuthorizer: false,
      })
    }
  }
  for (const secKey in openapi.components?.securitySchemes ?? {}) {
    if (
      !Object.prototype.hasOwnProperty.call(
        openapi.components?.securitySchemes!,
        secKey,
      )
    ) {
      continue
    }
    const sec = openapi.components?.securitySchemes![secKey]
    const { className, handlerName, policies } = manageFunctionMetadata<
    FunctionMetadata & PoliciesMetadata
    >(sec).get()
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
