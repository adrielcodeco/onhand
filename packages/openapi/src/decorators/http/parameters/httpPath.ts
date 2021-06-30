import 'reflect-metadata'
import { manageParameterMetadata } from '#/parameterMetadata'

export function HttpPath (type?: any) {
  return (target: any, propertyKey: string, index?: number) => {
    const propertyType =
      type || Reflect.getMetadata('design:type', target, propertyKey)
    manageParameterMetadata(target).change(metadata => {
      return Object.assign({}, metadata, {
        path: {
          name: `${String(target?.name || '')}PathInput`,
          type: JSON.stringify(propertyType),
        },
      })
    })
  }
}
