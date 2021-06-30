import AWS from 'aws-sdk'
import assert from 'assert'
import { FunctionOptions } from '#/app/functions'
import { throttling } from '#/cdk/sdkThrottling'

const lambda = new AWS.Lambda()

async function aliases (func: FunctionOptions, version: string, stage: string) {
  await createAlias(
    func.version,
    func.functionName,
    version,
    func.version.replace(/\./g, '-'),
  )
  const exists = await aliasAlreadyExists(func.functionName, stage)
  if (exists) {
    await deleteAlias(func.functionName, stage)
  }
  await createAlias(func.version, func.functionName, version, stage)
}

async function aliasAlreadyExists (functionName: string, alias: string) {
  try {
    const params: AWS.Lambda.GetAliasRequest = {
      FunctionName: functionName,
      Name: alias,
    }
    const { AliasArn } = await throttling(async () =>
      lambda.getAlias(params).promise(),
    )
    return !!AliasArn
  } catch {
    return false
  }
}

async function createAlias (
  label: string,
  functionName: string,
  version: string,
  alias: string,
) {
  const params: AWS.Lambda.CreateAliasRequest = {
    Description: label,
    FunctionName: functionName,
    FunctionVersion: version,
    Name: alias,
  }
  await throttling(async () => lambda.createAlias(params).promise())
}

async function deleteAlias (functionName: string, alias: string) {
  const params: AWS.Lambda.DeleteAliasRequest = {
    FunctionName: functionName,
    Name: alias,
  }
  await throttling(async () => lambda.deleteAlias(params).promise())
}

export async function handler (event: any) {
  try {
    const functionsString = event.ResourceProperties.functions
    const versionsString = event.ResourceProperties.versions
    const stage = event.ResourceProperties.stage

    assert(functionsString, '"functions" is required')
    const functions = JSON.parse(functionsString)

    assert(versionsString, '"versions" is required')
    const versions = JSON.parse(versionsString)

    assert(stage, '"stage" is required')

    switch (event.RequestType) {
      case 'Create':
      case 'Update': {
        for (const func of functions) {
          const version = versions.find(
            (r: any) => r.functionName === func.functionName,
          ).version
          await aliases(func, version, stage)
        }
        break
      }
      case 'Delete':
      default:
        console.log('does nothing on ', event.RequestType)
        break
    }
  } catch (err) {
    console.error(err)
    throw err
  }
}
