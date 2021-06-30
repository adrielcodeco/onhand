import 'reflect-metadata'

export function Deprecated () {
  return (target: any, propertyKey: string, index?: number) => {
    // const propertyType = Reflect.getMetadata('design:type', target, propertyKey)
    // TODO: implement parameter deprecation
  }
}
