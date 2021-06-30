import 'reflect-metadata'

type IN = 'query' | 'header' | 'path' | 'cookie'

export function HttpParameters ($in: IN, ...parameters: string[]) {
  return (target: any, propertyKey: string, index?: number) => {
    // const propertyType = Reflect.getMetadata('design:type', target, propertyKey)
    // TODO: define metadata for parameters
  }
}
