import { assert } from 'console'
import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda'
import { AWSFunctionContainerContext } from '#/infrastructure/awsFunctionContainerContext'
import { Operation } from '@onhand/controller/#/operation'
import { IAuthorizerFunction } from '#/infrastructure/apigateway/iAuthorizerFunction'
import { container } from '@onhand/business/#/ioc/container'
import { Ctor } from '@onhand/utils'

type AuthorizerCustomFunctionInput = {
  authorizationToken: string
  scope?: string
  deviceId?: string
  methodArn: string
}
type AuthorizerCustomFunctionOutput = {
  userIdentifier: string
  userRole: string
}

export abstract class AuthorizerCustomFunction implements IAuthorizerFunction {
  abstract get operation (): Ctor<
  Operation<AuthorizerCustomFunctionInput, AuthorizerCustomFunctionOutput>
  >

  constructor (
    private containerContextInitialization: AWSFunctionContainerContext,
  ) {}

  protected async inputAdapter (
    event: APIGatewayRequestAuthorizerEvent,
  ): Promise<AuthorizerCustomFunctionInput> {
    let authorizationToken = ''
    let scope
    let deviceId
    if (event.headers) {
      authorizationToken =
        this.findWithCaseInsensitive(event.headers, 'Authorization') ?? ''
      scope = this.findWithCaseInsensitive(event.headers, 'scope')
      deviceId = this.findWithCaseInsensitive(event.headers, 'deviceId')
    }
    if (authorizationToken) {
      authorizationToken = authorizationToken.replace(/Bearer\s/i, '')
    }
    return {
      authorizationToken,
      scope,
      deviceId,
      methodArn: event.methodArn,
    }
  }

  public async init (): Promise<void> {
    try {
      if (!this.containerContextInitialization) {
        this.containerContextInitialization = container.resolve(
          AWSFunctionContainerContext,
        )
      }
      await this.containerContextInitialization.init()
    } catch (err) {
      console.error(err)
    }
  }

  public async handle (
    event: APIGatewayRequestAuthorizerEvent,
    context: any,
    handlerCallback: (a: string | null, b?: any) => void,
  ) {
    assert(this.operation)
    try {
      const input = await this.inputAdapter(event)
      if (!input.authorizationToken) {
        throw new Error('Token cannot be empty!')
      }
      const operation = container.resolve<Operation>(this.operation)
      const operationResult = await operation.run(input)
      const { userIdentifier, userRole } = operationResult.data
      let resource
      if (input.methodArn) {
        const [
          arn,
          aws,
          executeApi,
          regionId,
          accountId,
          apiId,
          stage,
        ] = input.methodArn.split(/:|\//)
        resource = `${arn}:${aws}:${executeApi}:${regionId}:${accountId}:${apiId}/${stage}/*`
      } else {
        resource = '*'
      }
      const policy = this.generatePolicy(
        userIdentifier,
        'Allow',
        resource,
        userRole,
        input.scope,
        input.deviceId,
      )
      handlerCallback(null, policy)
    } catch (err) {
      err.requestId = context.awsRequestId
      console.error(err)
      handlerCallback('Unauthorized')
    }
  }

  private generatePolicy (
    principalId: string,
    effect: string,
    resource: string,
    role: string,
    scope?: string,
    deviceId?: string,
  ) {
    const authResponse: any = {
      principalId,
      context: {
        userIdentifier: principalId,
        userRole: role,
        userScope: scope,
        userDeviceId: deviceId,
      },
    }
    if (effect && resource) {
      authResponse.policyDocument = {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: effect,
            Resource: resource,
          },
        ],
      }
    }
    return authResponse
  }

  private findWithCaseInsensitive (obj: any, key: string) {
    for (const _key of Object.keys(obj)) {
      if (new RegExp(key, 'i').test(_key)) {
        return obj[_key]
      }
    }
  }
}
