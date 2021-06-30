import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda'
import { AWSFunctionContainerContext } from '#/infrastructure/awsFunctionContainerContext'
import {
  newContainerSandbox,
  container,
} from '@onhand/business/#/ioc/container'

import {
  userPoolIdSymbol,
  userPoolClientIdSymbol,
  userPoolRegionSymbol,
} from '#/services/cognitoService'
import {
  ICognitoService,
  ICognitoServiceToken,
} from '@onhand/business-aws/#/services'
import { IAuthorizerFunction } from '#/infrastructure/apigateway/iAuthorizerFunction'

type AuthorizerCustomFunctionInput = {
  authorizationToken: string
  scope?: string
  deviceId?: string
  methodArn: string
}

export abstract class AuthorizerCognitoFunction implements IAuthorizerFunction {
  abstract get userPoolId (): string
  abstract get userPoolClientId (): string
  abstract get userPoolRegion (): string

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
      if ('Authorization' in event.headers) {
        authorizationToken = event.headers.Authorization ?? ''
      }
      if ('scope' in event.headers) {
        scope = event.headers.scope
      }
      if ('deviceId' in event.headers) {
        deviceId = event.headers.deviceId
      }
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
  ): Promise<void> {
    try {
      const input = await this.inputAdapter(event)
      if (!input.authorizationToken) {
        throw new Error('Token cannot be empty!')
      }
      const sandbox = newContainerSandbox()
      sandbox.rebind(userPoolIdSymbol).toConstantValue(this.userPoolId)
      sandbox
        .rebind(userPoolClientIdSymbol)
        .toConstantValue(this.userPoolClientId)
      sandbox.rebind(userPoolRegionSymbol).toConstantValue(this.userPoolRegion)
      const cognitoService = sandbox.get<ICognitoService>(ICognitoServiceToken)
      const cognitoUser = await cognitoService.validateToken(
        input.authorizationToken,
      )
      if (!cognitoUser) {
        throw new Error('invalid token!')
      }
      const { userIdentifier, userRole } = cognitoUser
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
      )
      handlerCallback(null, policy)
    } catch (err) {
      err.requestId = context.awsRequestId
      console.error(err)
      handlerCallback('unauthorized')
    }
  }

  private generatePolicy (
    principalId: string,
    effect: string,
    resource: string,
    role: string,
  ) {
    const authResponse: any = {
      principalId,
      context: {
        userIdentifier: principalId,
        userRole: role,
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
}
