import AWS from 'aws-sdk'
import { Options, resourceName } from '@onhand/iac-aws/#/app/options'
import { throttling } from '#/server/libs/aws-sdk'

async function getApiGateway (apigateway: AWS.APIGateway, restApiName: string) {
  const { items: apis } = await throttling(async () =>
    apigateway.getRestApis({}).promise(),
  )
  const api = apis?.find(api => api.name === restApiName)
  if (api) {
    return api
  } else {
    throw new Error(`api not found with name: ${restApiName}`)
  }
}

async function getResources (apigateway: AWS.APIGateway, ApiId: string) {
  const { items: resources } = await throttling(async () =>
    apigateway.getResources({ restApiId: ApiId, embed: ['methods'] }).promise(),
  )
  return resources
}

async function getVersion (
  lambda: AWS.Lambda,
  FunctionName: string,
  alias: string,
) {
  const { Description: version } = await throttling(async () =>
    lambda.getAlias({ FunctionName, Name: alias }).promise(),
  )
  return version
}

export const fetchEnvVersions = async (
  env: string,
  options: Options,
  profileName: string,
  region: string,
) => {
  const credentials = new AWS.SharedIniFileCredentials({ profile: profileName })
  const apigateway = new AWS.APIGateway({ credentials, region })
  const lambda = new AWS.Lambda({ credentials, region })

  const newOptions: Options = { ...options, stage: env }
  const restApiName = resourceName(newOptions, 'api')
  const { id: ApiId } = await getApiGateway(apigateway, restApiName)
  const resources = await getResources(apigateway, ApiId!)
  const versions: any = {}
  if (resources) {
    const results = await Promise.all(
      resources.map(async ({ resourceMethods }) => {
        const results = []
        for (const key in resourceMethods ?? {}) {
          if (key === 'OPTIONS') {
            continue
          }
          const { operationName, methodIntegration } = resourceMethods![key]
          const { type, uri } = methodIntegration!
          if (type !== 'AWS_PROXY') {
            continue
          }
          const [, , , , , , , , , , , functionName, aliasName] =
            uri?.replace(/\/invocations$/, '')?.split(':') ?? []
          const version = await getVersion(lambda, functionName, aliasName)
          results.push({ operationName: operationName!, version })
        }
        return results
      }),
    )
    for (const methods of results) {
      for (const { operationName, version } of methods) {
        Object.assign(versions, { [operationName]: version })
      }
    }
  }
  return versions
}
