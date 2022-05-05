import { manageFunctionMetadata } from '#/metadata'

type HttpHeaderInput = {
  parameterName?: string
  type?: any
  description?: string
  required?: boolean
  deprecated?: boolean
}

const defaultInput: HttpHeaderInput = {
  required: false,
  deprecated: false,
}

export function HttpHeader (input: HttpHeaderInput | string = defaultInput) {
  return (target: any, propertyKey: string, index?: number) => {
    const { type, description, required, deprecated } =
      typeof input === 'string' ? defaultInput : input
    const propertyType =
      type || Reflect.getMetadata('design:type', target, propertyKey)

    const name =
      input && typeof input === 'string'
        ? input
        : input &&
          typeof input === 'object' &&
          'parameterName' in input &&
          input.parameterName
          ? input.parameterName
          : propertyKey

    manageFunctionMetadata(target).merge({
      operation: {
        parameters: [
          {
            name,
            in: 'header',
            description,
            required,
            deprecated,
            schema: {
              $ref: `#/components/schemas/${propertyType}`,
            },
            style: 'simple',
          },
        ],
      },
    })
  }
}
