import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda'

export interface IAuthorizerFunction {
  init: () => Promise<void>

  handle: (
    event: APIGatewayRequestAuthorizerEvent,
    context: any,
    handlerCallback: (a: string | null, b?: any) => void,
  ) => Promise<void>
}
