type Constructor<T> = { new (...args: any[]): T }

class Map<S, T> {
  private readonly maps: Array<{ fn: (s: S) => any, to: keyof T }> = []

  constructor (public source: Constructor<S>, public target: Constructor<T>) { }

  map (fn: (s: S) => any, to: keyof T): Map<S, T> {
    this.maps.push({ fn, to })
    return this
  }

  from (source: S) {
    return {
      to: (target?: T): T => {
        const newTarget = target ?? (Target => new Target())(this.target)
        for (const map of this.maps) {
          // eslint-disable-next-line @typescript-eslint/ban-types
          Reflect.set(newTarget as Object, map.to, map.fn(source))
        }
        return newTarget
      },
    }
  }
}

export function mapper<S, T> (source: Constructor<S>, target: Constructor<T>): Map<S, T> {
  return new Map<S, T>(source, target)
}
