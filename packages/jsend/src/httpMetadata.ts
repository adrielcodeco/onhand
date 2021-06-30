import 'reflect-metadata'

const symbolOnhandJSendHttpMetadata = Symbol.for('onhand-jsend-http-metadata')

type HttpMetadata = {
  statusCode: number
}

export function manageHttpMetadata<T> (obj: T) {
  const metadata: HttpMetadata = Reflect.getMetadata(
    symbolOnhandJSendHttpMetadata,
    obj,
  )
  const _ = {
    get: (): HttpMetadata => {
      return metadata
    },
    set: (metadata: HttpMetadata) => {
      Reflect.defineMetadata(symbolOnhandJSendHttpMetadata, metadata, obj)
      return _
    },
    change: (change: (metadata: HttpMetadata) => HttpMetadata) => {
      Reflect.defineMetadata(
        symbolOnhandJSendHttpMetadata,
        change(metadata),
        obj,
      )
      return _
    },
    changeKey: <P extends keyof HttpMetadata, T extends HttpMetadata[P]>(
      key: P,
      value: T,
    ) => {
      if (!metadata) {
        throw new Error('metadata not exits')
      }
      metadata[key] = value
      Reflect.defineMetadata(symbolOnhandJSendHttpMetadata, metadata, obj)
      return _
    },
    delete: <P extends keyof HttpMetadata>(key: P) => {
      if (!metadata) {
        throw new Error('metadata not exits')
      }
      Reflect.deleteProperty(metadata, key)
      Reflect.defineMetadata(symbolOnhandJSendHttpMetadata, metadata, obj)
      return _
    },
    end: (): T => obj,
  }
  return _
}
