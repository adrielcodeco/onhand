/* eslint-disable no-new */
import AWS from 'aws-sdk'
import moment from 'moment'
import * as cdk from '@aws-cdk/core'
import * as iam from '@aws-cdk/aws-iam'
import * as cr from '@aws-cdk/custom-resources'
import { Options, resourceName } from '#/app/options'
import { FunctionOptions } from '#/app/functions'
// eslint-disable-next-line max-len
import { Policy } from '@onhand/framework-aws/#/infrastructure/apigateway/metadata/policiesMetadata'

export class LambdaStack extends cdk.NestedStack {
  private readonly policy!: cr.AwsCustomResourcePolicy

  constructor (
    scope: cdk.Construct,
    private readonly options: Options,
    name: string,
  ) {
    super(scope, resourceName(options, `lambda-${name}`))

    this.policy = cr.AwsCustomResourcePolicy.fromSdkCalls({
      resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
    })
  }

  public create (func: FunctionOptions) {
    const timekey = moment().format('YYYYMMDDHHmmss')
    const { resource: roleResource, roleArn } = this.createRole(
      func.operationName,
      func.functionName,
      timekey,
      func.policies ?? [],
      func.version,
      this.region,
      this.account,
    )
    const { resource: lambdaResource, Version } = this.createLambda(
      func.bucketName,
      func.fileKey,
      func.functionName,
      func.handler,
      roleArn,
      func.description,
    )
    lambdaResource.node.addDependency(roleResource)
    const { resource: aliasResource } = this.ensureAlias(
      func.version,
      func.functionName,
      Version,
      timekey,
    )
    aliasResource.node.addDependency(lambdaResource)
  }

  private createLambda (
    bucketName: string,
    fileKey: string,
    functionName: string,
    handler: string,
    roleArn: string,
    description: string,
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
    }
    const sdkCall: cr.AwsSdkCall = {
      service: 'Lambda',
      action: 'createFunction',
      parameters: params,
      physicalResourceId: cr.PhysicalResourceId.of(
        resourceName(this.options, `createFunction-${functionName}`),
      ),
    }
    const resource = new cr.AwsCustomResource(
      this,
      resourceName(this.options, `createFunction-${functionName}`),
      {
        onCreate: sdkCall,
        onUpdate: sdkCall,
        policy: cr.AwsCustomResourcePolicy.fromStatements([
          new iam.PolicyStatement({
            actions: ['iam:PassRole'],
            effect: iam.Effect.ALLOW,
            resources: ['*'],
          }),
          new iam.PolicyStatement({
            actions: [
              'lambda:CreateFunction',
              's3:GetObject*',
              's3:GetBucket*',
              's3:List*',
              's3:PutObject*',
              's3:Abort*',
            ],
            effect: iam.Effect.ALLOW,
            resources: ['*'],
          }),
        ]),
      },
    )

    return {
      resource,
      FunctionName: resource.getResponseField('FunctionName'),
      Version: resource.getResponseField('FunctionName'),
    }
  }

  private createRole (
    operationName: string,
    functionName: string,
    timekey: string,
    policies: Policy[],
    version: string,
    awsRegion: string,
    awsAccount: string,
  ) {
    const params: AWS.IAM.CreateRoleRequest = {
      RoleName: resourceName(
        this.options,
        `func-${operationName}-role-${version}-${timekey}`,
        true,
      ),
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
    }
    const sdkCall = {
      service: 'IAM',
      action: 'createRole',
      parameters: params,
      physicalResourceId: cr.PhysicalResourceId.of(
        resourceName(this.options, `createRole-${operationName}`),
      ),
    }
    const resource = new cr.AwsCustomResource(
      this,
      resourceName(this.options, `createRole-${operationName}`),
      {
        onCreate: sdkCall,
        onUpdate: sdkCall,
        policy: this.policy,
      },
    )
    const roleName = resource.getResponseField('Role.RoleName')
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
        this.attachManagedRolePolicy(
          operationName,
          roleName,
          `arn:aws:iam::aws:policy/${policy.managedPolicy}`,
        )
      }
      if ('inlinePolicy' in policy) {
        this.attachInlineRolePolicy(
          operationName,
          roleName,
          resourceName(
            this.options,
            `policy-${operationName}-${policies.indexOf(policy)}`,
            true,
          ),
          policy.inlinePolicy,
        )
      }
    }
    return { resource, roleArn: resource.getResponseField('Role.Arn') }
  }

  private attachManagedRolePolicy (
    operationName: string,
    roleName: string,
    managedPolicyArn: string,
  ) {
    const params: AWS.IAM.AttachRolePolicyRequest = {
      RoleName: roleName,
      PolicyArn: managedPolicyArn,
    }
    const sdkCall = {
      service: 'IAM',
      action: 'attachRolePolicy',
      parameters: params,
      physicalResourceId: cr.PhysicalResourceId.of(
        resourceName(
          this.options,
          `attachRolePolicy-${operationName}-${managedPolicyArn}`,
        ),
      ),
    }
    new cr.AwsCustomResource(
      this,
      resourceName(
        this.options,
        `attachRolePolicy-${operationName}-${managedPolicyArn}`,
      ),
      {
        onCreate: sdkCall,
        onUpdate: sdkCall,
        policy: this.policy,
      },
    )
  }

  private attachInlineRolePolicy (
    operationName: string,
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
    const sdkCall = {
      service: 'IAM',
      action: 'putRolePolicy',
      parameters: params,
      physicalResourceId: cr.PhysicalResourceId.of(
        resourceName(
          this.options,
          `putRolePolicy-${operationName}-${policyName}`,
        ),
      ),
    }
    new cr.AwsCustomResource(
      this,
      resourceName(
        this.options,
        `putRolePolicy-${operationName}-${policyName}`,
      ),
      {
        onCreate: sdkCall,
        onUpdate: sdkCall,
        policy: this.policy,
      },
    )
  }

  private ensureAlias (
    label: string,
    functionName: string,
    version: string,
    timekey: string,
  ) {
    let resource: cr.AwsCustomResource | undefined
    const { resource: alias1Resource, success } = this.createAlias(
      label,
      functionName,
      version,
    )
    if (!success) {
      const { resource: alias2Resource } = this.createAlias(
        `${label}${timekey}`,
        functionName,
        version,
      )
      resource = alias2Resource
    } else {
      resource = alias1Resource
    }
    return { resource }
  }

  private createAlias (label: string, functionName: string, version: string) {
    const params: AWS.Lambda.CreateAliasRequest = {
      Description: label,
      FunctionName: functionName,
      FunctionVersion: version,
      Name: label.replace(/\./g, '-'),
    }
    const sdkCall: cr.AwsSdkCall = {
      service: 'Lambda',
      action: 'createAlias',
      parameters: params,
      ignoreErrorCodesMatching: '.',
      physicalResourceId: cr.PhysicalResourceId.of(
        resourceName(
          this.options,
          `createAlias-${functionName}-${label.replace(/\./g, '-')}`,
        ),
      ),
    }
    const resource = new cr.AwsCustomResource(
      this,
      resourceName(
        this.options,
        `createAlias-${functionName}-${label.replace(/\./g, '-')}`,
      ),
      {
        onCreate: sdkCall,
        onUpdate: sdkCall,
        policy: this.policy,
      },
    )
    let success = true
    try {
      resource.getResponseField('Name')
    } catch {
      success = false
    }
    return {
      resource,
      success,
    }
  }
}
