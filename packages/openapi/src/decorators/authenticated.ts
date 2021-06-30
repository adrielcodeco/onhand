import { managePathMetadata } from '#/pathMetadata'

type Constructor<T> = { new (...args: any[]): T }

export function Authenticated (name: string | null, ...permissions: string[]) {
  return (constructor: Constructor<any>) => {
    managePathMetadata(constructor).setAuthorized({
      name: name ?? 'default',
      permissions,
    })
    return constructor
  }
}
