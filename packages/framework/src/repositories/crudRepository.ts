import { Document } from 'dynamoose/dist/Document'
import { ModelType } from 'dynamoose/dist/General'
import { ICrudRepository } from '@onhand/business/#/repositories/iCrudRepository'

export abstract class CrudRepository<
  Model extends ModelType<M & Document>,
  M,
  IDTYPE
> implements ICrudRepository<M, IDTYPE> {
  constructor (protected model: Model) {}

  async list (filter: { [key in keyof M]?: any }): Promise<M[]> {
    const result: any = this.model.query(filter).exec()
    return result as Promise<M[]>
  }

  async findById (id: IDTYPE): Promise<M> {
    const result: any = this.model.query(id).exec()
    return result as Promise<M>
  }

  async add (model: M): Promise<M> {
    const result: any = this.model.create(model)
    return result as Promise<M>
  }

  async alter (id: IDTYPE, change: Partial<M>): Promise<M> {
    const result: any = this.model.update(id, change as Partial<M & Document>, {
      return: 'document',
    })
    return result as Promise<M>
  }

  async remove (id: IDTYPE): Promise<void> {
    await this.model.delete(id as any)
  }
}
