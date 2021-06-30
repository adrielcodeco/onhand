// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const defaultD = <D>() => ({} as D)

/* cSpell:disable */
/**
 * Copia as propriedades de @origin para @destiny que existam
 * nos dois objetos com o mesmo nome.
 * @param origin objeto de origem
 * @param destiny objeto de destino
 */
export function copy<
  O extends Record<string, any>,
  D extends Record<string, any>
> (origin: Partial<O>, destiny: D = defaultD<D>()): D {
  const originKeys = Object.getOwnPropertyNames(origin)
  for (const ok of originKeys) {
    if (Reflect.has(destiny, ok)) {
      Reflect.set(destiny, ok, Reflect.get(origin, ok))
    }
  }
  return destiny
}

/* cSpell:enable */
