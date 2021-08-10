import AWS from 'aws-sdk'
import assert from 'assert'
import { FunctionOptions } from '#/app/functions'
import { throttling } from '#/cdk/sdkThrottling'

const lambda = new AWS.Lambda()

async function functions (
  func: FunctionOptions,
  roleArn: string,
  updating: boolean,
  project: string,
  operationId: string,
) {
  const lambdaFunction = updating ? updateLambda : createLambda
  const { Version } = await lambdaFunction(
    func.bucketName,
    func.fileKey,
    func.functionName,
    func.handler,
    roleArn,
    func.description,
    project,
    operationId,
  )
  return Version
}

async function lambdaAlreadyExists (functionName: string) {
  try {
    const { Configuration } = await throttling(async () =>
      lambda
        .getFunction({
          FunctionName: functionName,
        })
        .promise(),
    )
    return !!Configuration
  } catch {
    return false
  }
}

async function createLambda (
  bucketName: string,
  fileKey: string,
  functionName: string,
  handler: string,
  roleArn: string,
  description: string,
  project: string,
  operationId: string,
) {
  const params: AWS.Lambda.CreateFunctionRequest = {
    Code: {
      S3Bucket: bucketName,
      S3Key: fileKey,
    } /* required */,
    FunctionName: functionName /* required */,
    Handler: handler /* required */,
    Role: roleArn /* required */,
    Runtime: 'nodejs14.x' /* required */,
    Description: description,
    MemorySize: 256,
    Timeout: 15,
    Tags: {
      onhandProject: project,
      onhandOperationId: operationId,
      onhandResource: 'function',
      onhandResourceGroup: 'operation',
    },
  }
  const { Version } = await throttling(async () =>
    lambda.createFunction(params).promise(),
  )

  return {
    Version,
  }
}

async function updateLambda (
  bucketName: string,
  fileKey: string,
  functionName: string,
  handler: string,
  roleArn: string,
  description: string,
  project: string,
  operationId: string,
) {
  const params1: AWS.Lambda.UpdateFunctionConfigurationRequest = {
    FunctionName: functionName /* required */,
    Handler: handler /* required */,
    Role: roleArn /* required */,
    Runtime: 'nodejs14.x' /* required */,
    Description: description,
    MemorySize: 256,
    Timeout: 15,
  }
  await throttling(async () =>
    lambda.updateFunctionConfiguration(params1).promise(),
  )

  await throttling(async () =>
    lambda
      .tagResource({
        Resource: '',
        Tags: {
          onhandProject: project,
          onhandOperationId: operationId,
          onhandResource: 'function',
          onhandResourceGroup: 'operation',
        },
      })
      .promise(),
  )

  const params2: AWS.Lambda.UpdateFunctionCodeRequest = {
    FunctionName: functionName,
    S3Bucket: bucketName,
    S3Key: fileKey,
    Publish: true,
  }
  const { Version } = await throttling(async () =>
    lambda.updateFunctionCode(params2).promise(),
  )

  return {
    Version,
  }
}

export async function handler (event: any) {
  try {
    const functionsString = event.ResourceProperties.functions
    const rolesString = event.ResourceProperties.roles
    const project = event.ResourceProperties.project
    const operationId = event.ResourceProperties.project

    assert(functionsString, '"functions" is required')
    const funcs = JSON.parse(functionsString)

    assert(rolesString, '"roles" is required')
    const roles = JSON.parse(rolesString)

    assert(project, '"project" is required')

    switch (event.RequestType) {
      case 'Create':
      case 'Update': {
        const result = []
        for (const func of funcs) {
          const updating = await lambdaAlreadyExists(func.functionName)
          const roleArn = roles.find(
            (r: any) => r.functionName === func.functionName,
          ).roleArn
          const version = await functions(
            func,
            roleArn,
            updating,
            project,
            operationId,
          )
          result.push({ functionName: func.functionName, version })
        }
        return { Data: { result: JSON.stringify(result) } }
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

  return {}
}
