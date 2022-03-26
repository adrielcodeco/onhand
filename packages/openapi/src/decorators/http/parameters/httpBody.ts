import { manageFunctionMetadata } from '#/metadata'

type HttpBodyInput = {
  type?: any
  mediaType?: string
  description?: string
  required?: boolean
}

const defaultInput: HttpBodyInput = {
  required: true,
}

export function HttpBody (input: HttpBodyInput = defaultInput) {
  return (target: any, propertyKey: string, index?: number) => {
    const { type, mediaType, description, required } = input
    const propertyType =
      type || Reflect.getMetadata('design:type', target, propertyKey)

    manageFunctionMetadata(target).merge({
      operation: {
        requestBody: {
          description,
          content: {
            [mediaType ?? 'application/json']: {
              schema: {
                $ref: `#/components/schemas/${propertyType}`,
              },
              examples: {},
            },
          },
          required,
        },
      },
    })
  }
}
