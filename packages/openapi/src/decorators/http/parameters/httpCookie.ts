import 'reflect-metadata'
import { manageParameterMetadata } from '#/parameterMetadata'

export function HttpCookie (type?: any) {
  return (target: any, propertyKey: string, index?: number) => {
    const propertyType =
      type || Reflect.getMetadata('design:type', target, propertyKey)
    manageParameterMetadata(target).change(metadata => {
      return Object.assign({}, metadata, {
        cookie: {
          name: `${String(target?.name || '')}CookieInput`,
          type: JSON.stringify(propertyType),
        },
      })
    })
  }
}
