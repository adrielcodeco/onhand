import { repository } from '@onhand/framework/#/ioc/decorators'
import { IOpaqueTokenRepository } from '@onhand/business-aws/#/repositories'
import { OpaqueToken } from '@onhand/domain-aws'
import { OpaqueTokenModelProvider } from '#/models/opaqueTokenModel'

@repository()
export class OpaqueTokenRepository implements IOpaqueTokenRepository {
  private readonly OpaqueTokenModel = OpaqueTokenModelProvider()

  async find (opaqueToken: string): Promise<OpaqueToken | undefined> {
    return this.OpaqueTokenModel.query(opaqueToken)
      .exec()
      .then((results: any[]) =>
        results?.length ? (results[0] as OpaqueToken) : undefined,
      )
  }

  async add (entity: OpaqueToken): Promise<void> {
    await this.OpaqueTokenModel.create(entity)
  }

  async remove (opaqueToken: string): Promise<void> {
    await this.OpaqueTokenModel.delete(opaqueToken)
  }

  async purgeUserTokens (userIdentifier: string): Promise<void> {
    const keys = await this.OpaqueTokenModel.query({ userIdentifier })
      .using('userIdentifier-index')
      .exec()
      .then((results: any[]) => results.map(r => r.opaqueToken))
    await this.OpaqueTokenModel.batchDelete(keys)
  }
}
