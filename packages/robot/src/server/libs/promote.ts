import AWS from 'aws-sdk'
import { throttling } from '#/server/libs/aws-sdk'

async function isOperation (
  lambda: AWS.Lambda,
  projectName: string,
  FunctionArn: string,
) {
  const { Tags } = await throttling(async () =>
    lambda.listTags({ Resource: FunctionArn }).promise(),
  )
  return (
    Tags &&
    'onhandProject' in Tags &&
    Tags.onhandProject === projectName &&
    'onhandResource' in Tags &&
    Tags.onhandResource === 'function' &&
    'onhandResourceGroup' in Tags &&
    (Tags.onhandResourceGroup === 'operation' ||
      Tags.onhandResourceGroup === 'pipeline')
  )
}

export const promoteFunction = async (operationId: string) => {}

export const promoteAllFunctions = async ({
  originEnv,
  targetEnv,
  projectName,
  region,
  profileName,
}: {
  originEnv: string
  targetEnv: string
  projectName: string
  region: string
  profileName: string
}) => {
  const credentials = new AWS.SharedIniFileCredentials({ profile: profileName })
  const lambda = new AWS.Lambda({ credentials, region })
  const { Functions } = await throttling(async () =>
    lambda.listFunctions({}).promise(),
  )
  for (const { FunctionName, FunctionArn } of Functions ?? []) {
    if (
      !FunctionName ||
      !FunctionName.startsWith(`${projectName}-`) ||
      FunctionName.startsWith(`${projectName}-onhand-`)
    ) {
      continue
    }
    console.log('function found:', FunctionName)
    const isOp = await isOperation(lambda, projectName, FunctionArn!)
    if (!isOp) {
      continue
    }
    await throttling(async () =>
      lambda
        .invoke({
          FunctionName: '',
          Payload: JSON.stringify({
            functionName: FunctionName,
            originAlias: originEnv,
            targetStage: targetEnv,
          }),
        })
        .promise(),
    )
    console.log('function promoted:', FunctionName)
  }
}
