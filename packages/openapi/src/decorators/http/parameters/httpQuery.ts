import 'reflect-metadata'
import { manageParameterMetadata } from '#/parameterMetadata'

export function HttpQuery (type?: any) {
  return (target: any, propertyKey: string, index?: number) => {
    const propertyType =
      type || Reflect.getMetadata('design:type', target, propertyKey)
    manageParameterMetadata(target).change(metadata => {
      return Object.assign({}, metadata, {
        query: {
          name: `${String(target?.name || '')}QueryInput`,
          type: JSON.stringify(propertyType),
        },
      })
    })
  }
}
