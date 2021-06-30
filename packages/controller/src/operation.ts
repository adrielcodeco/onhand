import { Response } from '@onhand/jsend'

export abstract class Operation<I extends any = any, O extends any = any> {
  abstract run (input: I): Promise<Response<O>>
}
