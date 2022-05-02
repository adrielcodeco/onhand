import 'reflect-metadata'
import { manageMetadata } from '@onhand/utils'

const symbolOnhandJSendHttpMetadata = Symbol.for('onhand-jsend-http-metadata')

type HttpMetadata = {
  statusCode: number
  headers?: { [name: string]: string }
}

export function manageHttpMetadata<M extends HttpMetadata> (target: any) {
  return manageMetadata<M>(target, symbolOnhandJSendHttpMetadata)
}
