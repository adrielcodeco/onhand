import AWS from 'aws-sdk'
import assert from 'assert'

const lambda = new AWS.Lambda()

export async function handler (event: any) {
  try {
    const { functionName } = event
    assert(functionName, '"functionName" is required')
    const exists = await lambdaAlreadyExists(functionName)
    return exists
  } catch (err) {
    console.error(err)
    throw err
  }
}

async function lambdaAlreadyExists (functionName: string) {
  try {
    const { Configuration } = await getLambda(functionName)
    return !!Configuration
  } catch {
    return false
  }
}

async function getLambda (functionName: string) {
  const params: AWS.Lambda.GetFunctionRequest = {
    FunctionName: functionName,
  }
  return lambda.getFunction(params).promise()
}
