import AWS from 'aws-sdk'
import assert from 'assert'
import { FunctionOptions } from '#/app/functions'
import { throttling } from '#/cdk/sdkThrottling'
// eslint-disable-next-line max-len
import { Policy } from '@onhand/framework-aws/#/infrastructure/apigateway/metadata/policiesMetadata'

const iam = new AWS.IAM()

async function roles (
  func: FunctionOptions,
  region: string,
  account: string,
  timekey: string,
  project: string,
) {
  const { roleArn } = await createRole(
    func.operationName,
    func.functionName,
    timekey,
    func.policies ?? [],
    func.version,
    region,
    account,
    project,
  )
  return roleArn
}

async function createRole (
  operationName: string,
  functionName: string,
  timekey: string,
  policies: Policy[],
  version: string,
  awsRegion: string,
  awsAccount: string,
  project: string,
) {
  const roleName = `${functionName}Role-${version}`
  const params: AWS.IAM.CreateRoleRequest = {
    RoleName: roleName,
    AssumeRolePolicyDocument: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
        },
      ],
    }),
    Tags: [
      {
        Key: 'onhandProject',
        Value: project,
      },
      {
        Key: 'onhandResource',
        Value: 'role',
      },
      {
        Key: 'onhandResourceGroup',
        Value: 'operation',
      },
    ],
  }
  const {
    Role: { Arn: roleArn },
  } = await throttling(async () => iam.createRole(params).promise())
  console.log('created function:', roleArn)
  const logPolicy: Policy = {
    inlinePolicy: {
      actions: ['logs:*'],
      effect: 'Allow',
      resources: [
        `arn:aws:logs:${awsRegion}:${awsAccount}:log-group:/aws/lambda/${functionName}:*`,
      ],
    },
  }
  policies.push(logPolicy)
  for (const policy of policies) {
    if ('managedPolicy' in policy) {
      await attachManagedRolePolicy(
        roleName,
        `arn:aws:iam::aws:policy/${policy.managedPolicy}`,
      )
    }
    if ('inlinePolicy' in policy) {
      await attachInlineRolePolicy(
        roleName,
        `policy-${operationName}-${policies.indexOf(policy)}`,
        policy.inlinePolicy,
      )
    }
  }
  return { roleArn }
}

async function attachManagedRolePolicy (
  roleName: string,
  managedPolicyArn: string,
) {
  const params: AWS.IAM.AttachRolePolicyRequest = {
    RoleName: roleName,
    PolicyArn: managedPolicyArn,
  }
  await throttling(async () => iam.attachRolePolicy(params).promise())
}

async function attachInlineRolePolicy (
  roleName: string,
  policyName: string,
  inlinePolicy: any,
) {
  const params: AWS.IAM.PutRolePolicyRequest = {
    PolicyName: policyName,
    PolicyDocument: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Action: inlinePolicy.actions,
          Effect: inlinePolicy.effect,
          Resource: inlinePolicy.resources,
        },
      ],
    }),
    RoleName: roleName,
  }
  await throttling(async () => iam.putRolePolicy(params).promise())
}

export async function handler (event: any) {
  try {
    const functionsString = event.ResourceProperties.functions
    const region = event.ResourceProperties.region
    const account = event.ResourceProperties.account
    const timekey = event.ResourceProperties.timekey
    const project = event.ResourceProperties.project

    assert(functionsString, '"functions" is required')
    const functions = JSON.parse(functionsString)

    assert(region, '"region" is required')
    assert(account, '"account" is required')
    assert(timekey, '"timekey" is required')
    assert(project, '"project" is required')

    switch (event.RequestType) {
      case 'Create':
      case 'Update': {
        const result = []
        for (const func of functions) {
          const roleArn = await roles(func, region, account, timekey, project)
          result.push({ functionName: func.functionName, roleArn })
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
