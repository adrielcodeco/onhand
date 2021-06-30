export function omitProperties<T, K extends keyof T> (
  target: T,
  ...properties: Array<K | string>
): T {
  if (typeof target !== 'object') {
    return target
  }
  if (Array.isArray(target)) {
    for (const item of target) {
      for (const property of properties) {
        Reflect.deleteProperty(item, property)
      }
    }
  } else {
    for (const property of properties) {
      Reflect.deleteProperty(target as any, property)
    }
  }
  return target
}
