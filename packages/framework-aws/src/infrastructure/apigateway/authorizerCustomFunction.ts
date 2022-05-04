import { assert } from 'console'
import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda'
import { AWSFunctionContainerContext } from '#/infrastructure/awsFunctionContainerContext'
import { Operation } from '@onhand/controller/#/operation'
import { IAuthorizerFunction } from '#/infrastructure/apigateway/iAuthorizerFunction'
import { container } from '@onhand/business/#/ioc/container'
import { Ctor } from '@onhand/utils'

type AuthorizerCustomFunctionInput = {
  authorizationToken: string
  methodArn: string
} & { [k: string]: any }
type AuthorizerCustomFunctionOutput = {
  userIdentifier: string
  userRole: string
}

export abstract class AuthorizerCustomFunction implements IAuthorizerFunction {
  abstract get operation (): Ctor<
  Operation<AuthorizerCustomFunctionInput, AuthorizerCustomFunctionOutput>
  >

  public authorizationTokenHeader = 'Authorization'

  public identitySourcesHeaders = [
    'Authorization',
    'scope',
    'device-id',
    'cookie',
  ]

  constructor (
    private containerContextInitialization: AWSFunctionContainerContext,
  ) {}

  protected async inputAdapter (
    event: APIGatewayRequestAuthorizerEvent,
  ): Promise<AuthorizerCustomFunctionInput> {
    const input: AuthorizerCustomFunctionInput =
      this.identitySourcesHeaders.reduce<AuthorizerCustomFunctionInput>(
        (acc, header) => {
          acc[header] = this.findWithCaseInsensitive(
            event.headers ?? {},
            header,
          )
          return acc
        },
        {
          authorizationToken: '',
          methodArn: event.methodArn,
        },
      )
    if (this.authorizationTokenHeader in input) {
      input.authorizationToken = input[this.authorizationTokenHeader]
    }
    if (input.authorizationToken) {
      input.authorizationToken = input.authorizationToken.replace(
        /Bearer\s/i,
        '',
      )
    }
    return input
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
      const { authorizationToken, methodArn, ...identitySources } =
        await this.inputAdapter(event)
      if (!authorizationToken) {
        throw new Error('Token cannot be empty!')
      }
      const operation = container.resolve<Operation>(this.operation)
      const operationResult = await operation.run({
        authorizationToken,
        methodArn,
        ...identitySources,
      })
      const { userIdentifier, userRole } = operationResult.data
      let resource
      if (methodArn) {
        const [arn, aws, executeApi, regionId, accountId, apiId, stage] =
          methodArn.split(/:|\//)
        resource = `${arn}:${aws}:${executeApi}:${regionId}:${accountId}:${apiId}/${stage}/*`
      } else {
        resource = '*'
      }
      const policy = this.generatePolicy(
        userIdentifier,
        'Allow',
        resource,
        userRole,
        identitySources,
      )
      handlerCallback(null, policy)
    } catch (err: any) {
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
    identitySources?: any,
  ) {
    const authResponse: any = {
      principalId,
      context: {
        userIdentifier: principalId,
        userRole: role,
        ...identitySources,
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
      if (_key.toLocaleLowerCase() === key.toLocaleLowerCase()) {
        return obj[_key]
      }
    }
  }
}
