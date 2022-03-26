import { manageFunctionMetadata } from '#/metadata'

type HttpQueryInput = {
  type?: any
  description?: string
  required?: boolean
  deprecated?: boolean
}

const defaultInput: HttpQueryInput = {
  required: false,
  deprecated: false,
}

export function HttpQuery (input: HttpQueryInput = defaultInput) {
  return (target: any, propertyKey: string, index?: number) => {
    const { type, description, required, deprecated } = input
    const propertyType =
      type || Reflect.getMetadata('design:type', target, propertyKey)

    manageFunctionMetadata(target).merge({
      operation: {
        parameters: [
          {
            name: propertyKey,
            in: 'query',
            description,
            required,
            deprecated,
            schema: {
              $ref: `#/components/schemas/${propertyType}`,
            },
            style: 'form',
            explode: true,
          },
        ],
      },
    })
  }
}
