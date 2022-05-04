import { assert } from 'console'
import { validate } from 'class-validator'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda'
import { Operation } from '@onhand/controller/#/operation'
import { container } from '@onhand/business/#/ioc/container'
import {
  AFunction,
  HttpMethods,
} from '@onhand/framework/#/infrastructure/aFunction'
import { Unauthorized, UnprocessableEntity } from '@onhand/jsend'
import { manageFunctionMetadata } from '@onhand/openapi'
import { Ctor } from '@onhand/utils'
import { ACRule } from '@onhand/accesscontrol'
import { CheckGrantUseCase } from '@onhand/business-aws/#/useCases/accessControl/checkGrantUseCase'
import { AWSFunctionContainerContext } from '#/infrastructure/awsFunctionContainerContext'
import { AWSFunctionHandleContext } from '#/infrastructure/awsFunctionHandleContext'
import { Output } from '#/infrastructure/apigateway/apigatewayOutput'
import { Ownership } from '@onhand/business/#/ownership'
import { UserContext } from '@onhand/business/#/dto/userContext'
import { ILogger, LogToken } from '@onhand/business/#/modules/logger'
import { inject, injectable } from 'inversify'

export type AWSFunctionOptions = {
  permissions?: ACRule[]
  authenticated?: boolean
}

type E = APIGatewayProxyEvent

@injectable()
export abstract class ApiGatewayFunction extends AFunction {
  abstract get inputAdapterType (): any
  abstract get operation (): Ctor<Operation>

  permissions?: ACRule[]
  authenticated?: boolean
  httpMethod: HttpMethods = HttpMethods.GET
  ownership?: Ctor<Ownership<any>>

  @inject(LogToken)
  private readonly logger!: ILogger

  constructor (
    private readonly options: AWSFunctionOptions,
    private containerContextInitialization: AWSFunctionContainerContext,
    private handleContextInitialization: AWSFunctionHandleContext<E>,
  ) {
    super()
    this.options = this.options ?? {}
    if (this.permissions) {
      this.options.permissions = this.permissions
    }
    if (this.authenticated) {
      this.options.authenticated = this.authenticated
    }
    if (
      Reflect.has(this.options, 'authenticated') &&
      typeof this.options.authenticated === 'boolean'
    ) {
      this.handleContextInitialization.options.authenticated =
        options.authenticated!
    }
  }

  protected async inputAdapter (event: E): Promise<any> {
    const input: any = {}
    const InputAdapterType = this.inputAdapterType
    const parameterMetadata = manageFunctionMetadata(this).get()
    if (parameterMetadata?.operation.requestBody) {
      Object.assign(input, JSON.parse(event.body ?? '{}'))
    }
    const queryParameters = parameterMetadata?.operation.parameters?.filter(
      p => p && 'in' in p && p.in === 'query',
    )
    if (queryParameters?.length) {
      const queryString = Object.assign(
        {},
        event.queryStringParameters,
        event.multiValueQueryStringParameters,
      )
      for (const query of queryParameters) {
        if ('name' in query && query.name in queryString) {
          input[query.name] = queryString[query.name]
        }
      }
    }
    const pathParameters = parameterMetadata?.operation.parameters?.filter(
      p => p && 'in' in p && p.in === 'path',
    )
    if (pathParameters?.length) {
      const parameters: any = Object.assign({}, event.pathParameters)
      for (const query of pathParameters) {
        if ('name' in query && query.name in parameters) {
          input[query.name] = parameters[query.name]
        }
      }
    }
    const cookieParameters = parameterMetadata?.operation.parameters?.filter(
      p => p && 'in' in p && p.in === 'cookie',
    )
    if (cookieParameters?.length) {
      const cookies: any =
        event.headers?.cookie
          ?.split(';')
          ?.reduce((accumulator: any, currentValue) => {
            const [key, value] = currentValue.split('=')
            accumulator[key.trim()] = value
            return accumulator
          }, {}) ?? {}
      for (const query of cookieParameters) {
        if ('name' in query && query.name in cookies) {
          input[query.name] = cookies[query.name]
        }
      }
    }
    const inputAdapter = new InputAdapterType()
    Object.assign(inputAdapter, input)
    this.logger.debug('input:', inputAdapter)
    const errors = await validate(inputAdapter, {
      skipUndefinedProperties: false,
      skipNullProperties: false,
      skipMissingProperties: false,
      forbidUnknownValues: false,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
    if (errors?.length) {
      throw UnprocessableEntity(
        errors.map(i => ({
          property: i.property,
          constraints: i.constraints,
        })),
      )
    }
    return inputAdapter
  }

  public async init (): Promise<void> {
    try {
      if (!this.containerContextInitialization) {
        this.containerContextInitialization = container.resolve(
          AWSFunctionContainerContext,
        )
      }
      await this.containerContextInitialization.init()
      if (!this.handleContextInitialization) {
        this.handleContextInitialization = container.resolve(
          AWSFunctionHandleContext,
        )
        if (
          Reflect.has(this.options, 'authenticated') &&
          typeof this.options.authenticated === 'boolean'
        ) {
          this.handleContextInitialization.options.authenticated =
            this.options.authenticated
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  public async handle (
    event: APIGatewayProxyEvent,
    context: Context,
  ): Promise<APIGatewayProxyResult> {
    assert(this.operation)
    try {
      this.logger.debug('event:', event)
      this.logger.debug('context:', context)
      if (container.isBound('stage')) {
        container.rebind('stage').toConstantValue(event.stageVariables?.stage)
      } else {
        container.bind('stage').toConstantValue(event.stageVariables?.stage)
      }
      await this.handleContextInitialization.init(event)
      const input = await this.inputAdapter(event)
      let hasOwnership = false
      if (this.authenticated && this.permissions?.length) {
        const role = event.requestContext.authorizer?.userRole
        let granted = !!role
        if (granted) {
          const checkGrantUseCase = container.resolve(CheckGrantUseCase)
          granted &&= await checkGrantUseCase.exec({
            role,
            rules: this.permissions,
            ownership: async (): Promise<boolean> => {
              if (!this.ownership) {
                return false
              }
              const ownership = container.resolve<Ownership<any>>(
                this.ownership,
              )
              hasOwnership = !!ownership
              return (
                !!ownership &&
                ownership.owner(
                  input,
                  event.requestContext.authorizer as UserContext,
                )
              )
            },
          })
        }
        if (!granted) {
          if (
            !hasOwnership &&
            this.permissions?.find(p => p.possession === 'own')
          ) {
            console.error(
              'this request have an "own" possession for some permission ' +
                ' but the handle not have an ownership implementation,' +
                ' maybe its need an ownership implementation',
            )
          }
          throw Unauthorized("You don't have permission to execute this action")
        }
      }
      const operation = container.resolve<Operation>(this.operation)
      const result = await operation.run(input)
      const headers = {}
      // CORS(event.headers, headers)
      const output = Output(result, headers)
      this.logger.debug('output:', output)
      return output
    } catch (err: any) {
      const output = Output(err)
      this.logger.debug('output:', output)
      return output
    }
  }
}
