import 'reflect-metadata'
import { manageParameterMetadata } from '#/parameterMetadata'

export function HttpBody (type?: any) {
  return (target: any, propertyKey: string, index?: number) => {
    const propertyType =
      type || Reflect.getMetadata('design:type', target, propertyKey)
    manageParameterMetadata(target).change(metadata => {
      return Object.assign({}, metadata, {
        body: {
          name: `${String(target?.name || '')}BodyInput`,
          type: JSON.stringify(propertyType),
        },
      })
    })
  }
}
