import 'reflect-metadata'
import { manageParameterMetadata } from '#/parameterMetadata'

export function HttpHeader (type?: any) {
  return (target: any, propertyKey: string, index?: number) => {
    const propertyType =
      type || Reflect.getMetadata('design:type', target, propertyKey)
    manageParameterMetadata(target).change(metadata => {
      return Object.assign({}, metadata, {
        header: {
          name: `${String(target?.name || '')}HeaderInput`,
          type: JSON.stringify(propertyType),
        },
      })
    })
  }
}
