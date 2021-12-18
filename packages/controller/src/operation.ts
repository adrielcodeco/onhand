import { Response } from '@onhand/jsend'

export abstract class Operation<I = any, O = any> {
  abstract run (input: I): Promise<Response<O>>
}
