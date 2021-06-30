import 'reflect-metadata'

const symbolOnhandAPIParameterMetadata = Symbol.for(
  'onhand-api-parameter-metadata',
)

type ParameterMetadata = {
  [type in 'body' | 'path' | 'query' | 'cookie' | 'header']: {
    name: string
    type: string
  }
}

export function manageParameterMetadata<T> (func: T) {
  const metadata: ParameterMetadata = Reflect.getMetadata(
    symbolOnhandAPIParameterMetadata,
    func,
  )
  const _ = {
    get: (): ParameterMetadata => {
      return metadata
    },
    set: (metadata: ParameterMetadata) => {
      Reflect.defineMetadata(symbolOnhandAPIParameterMetadata, metadata, func)
      return _
    },
    change: (change: (metadata: ParameterMetadata) => ParameterMetadata) => {
      Reflect.defineMetadata(
        symbolOnhandAPIParameterMetadata,
        change(metadata),
        func,
      )
      return _
    },
    changeKey: <
      P extends keyof ParameterMetadata,
      T extends ParameterMetadata[P]
    >(
      key: P,
      value: T,
    ) => {
      if (!metadata) {
        throw new Error('metadata not exits')
      }
      metadata[key] = value
      Reflect.defineMetadata(symbolOnhandAPIParameterMetadata, metadata, func)
      return _
    },
    delete: <P extends keyof ParameterMetadata>(key: P) => {
      if (!metadata) {
        throw new Error('metadata not exits')
      }
      Reflect.deleteProperty(metadata, key)
      Reflect.defineMetadata(symbolOnhandAPIParameterMetadata, metadata, func)
      return _
    },
    end: () => func,
  }
  return _
}
