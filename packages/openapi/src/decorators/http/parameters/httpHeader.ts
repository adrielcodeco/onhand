import { manageFunctionMetadata } from '#/metadata'

type HttpHeaderInput = {
  type?: any
  description?: string
  required?: boolean
  deprecated?: boolean
}

const defaultInput: HttpHeaderInput = {
  required: false,
  deprecated: false,
}

export function HttpHeader (input: HttpHeaderInput = defaultInput) {
  return (target: any, propertyKey: string, index?: number) => {
    const { type, description, required, deprecated } = input
    const propertyType =
      type || Reflect.getMetadata('design:type', target, propertyKey)

    manageFunctionMetadata(target).merge({
      operation: {
        parameters: [
          {
            name: propertyKey,
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
