export interface ICrudRepository<M, IDTYPE> {
  list: (filter: { [key in keyof M]?: any }) => Promise<M[]>
  findById: (id: IDTYPE) => Promise<M>
  add: (model: M) => Promise<M>
  alter: (id: IDTYPE, change: Partial<M>) => Promise<M>
  remove: (id: IDTYPE) => Promise<void>
}
