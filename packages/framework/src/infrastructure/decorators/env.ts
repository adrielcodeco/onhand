export function Env (key?: string) {
  return (target: any, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      get () {
        return (
          process.env[key ?? propertyKey] ?? this[`${propertyKey}-defaultValue`]
        )
      },
      set (newValue) {
        this[`${propertyKey}-defaultValue`] = newValue
      },
    })
  }
}
