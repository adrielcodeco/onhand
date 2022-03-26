import { manageFunctionMetadata } from '#/metadata'

type HttpCookieInput = {
  type?: any
  description?: string
  required?: boolean
  deprecated?: boolean
}

const defaultInput: HttpCookieInput = {
  required: false,
  deprecated: false,
}

export function HttpCookie (input: HttpCookieInput = defaultInput) {
  return (target: any, propertyKey: string, index?: number) => {
    const { type, description, required, deprecated } = input
    const propertyType =
      type || Reflect.getMetadata('design:type', target, propertyKey)

    manageFunctionMetadata(target).merge({
      operation: {
        parameters: [
          {
            name: propertyKey,
            in: 'cookie',
            description,
            required,
            deprecated,
            schema: {
              $ref: `#/components/schemas/${propertyType}`,
            },
            style: 'form',
          },
        ],
      },
    })
  }
}
