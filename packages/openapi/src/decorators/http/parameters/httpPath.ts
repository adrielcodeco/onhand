import { manageFunctionMetadata } from '#/metadata'

type HttpPathInput = {
  parameterName?: string
  type?: any
  description?: string
  required?: boolean
  deprecated?: boolean
}

const defaultInput: HttpPathInput = {
  required: true,
  deprecated: false,
}

export function HttpPath (input: HttpPathInput | string = defaultInput) {
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
            in: 'path',
            description,
            required,
            deprecated,
            schema: {
              $ref: `#/components/schemas/${propertyType}`,
            },
            style: 'simple',
            explode: true,
          },
        ],
      },
    })
  }
}
