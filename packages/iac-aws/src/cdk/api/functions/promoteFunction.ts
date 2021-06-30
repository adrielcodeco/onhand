import AWS from 'aws-sdk'
import assert from 'assert'

const lambda = new AWS.Lambda()

export async function handler (event: any) {
  try {
    const { functionName, originAlias, targetStage } = event

    assert(functionName, '"functionName" is required')
    assert(originAlias, '"originAlias" is required')
    assert(targetStage, '"targetStage" is required')

    const originAliasDetails = await getAlias(functionName, originAlias)
    assert(
      !!originAliasDetails,
      `the "originAlias": "${originAlias}" not found`,
    )
    const targetAlias = await aliasAlreadyExists(functionName, targetStage)
    if (targetAlias) {
      await deleteAlias(functionName, targetStage)
    }
    await createAlias(
      originAliasDetails.Description!,
      functionName,
      originAliasDetails.FunctionVersion!,
      targetStage,
    )
  } catch (err) {
    console.error(err)
    throw err
  }
}

async function aliasAlreadyExists (functionName: string, alias: string) {
  try {
    const { AliasArn } = await getAlias(functionName, alias)
    return !!AliasArn
  } catch {
    return false
  }
}

async function getAlias (functionName: string, alias: string) {
  const params: AWS.Lambda.GetAliasRequest = {
    FunctionName: functionName,
    Name: alias,
  }
  return lambda.getAlias(params).promise()
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
  await lambda.createAlias(params).promise()
}

async function deleteAlias (functionName: string, alias: string) {
  const params: AWS.Lambda.DeleteAliasRequest = {
    FunctionName: functionName,
    Name: alias,
  }
  await lambda.deleteAlias(params).promise()
}
