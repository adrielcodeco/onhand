import { injectable, inject } from 'inversify'
import axios from 'axios'
import { ILogger, LogToken } from '@onhand/business/#/modules/logger'
import { container } from '@onhand/business/#/ioc/container'
import { TYPES } from '@onhand/business/#/ioc/types'
import {
  AWSFunctionContainerContextOptions,
  AWSFunctionContainerContextOptionsToken,
} from '#/infrastructure/awsFunctionContainerContextOptions'
import { interceptors } from '@onhand/framework/#/infrastructure/axiosInterceptors'
import { initSSM } from '#/infrastructure/initSSM'
import dynamoose from 'dynamoose'

@injectable()
export class AWSFunctionContainerContext {
  @inject(LogToken)
  private readonly logger!: ILogger

  @inject(AWSFunctionContainerContextOptionsToken)
  readonly options!: AWSFunctionContainerContextOptions

  async init (): Promise<void> {
    if (process.env.NO_INIT === 'true') {
      return
    }
    this.logger.debug('initializing containerContext', this.options)
    await this.initSSM()
    await this.initLogger()
    await this.initConfig()
    await this.initDB()
    await this.initFeatureFlags()
  }

  async initSSM (): Promise<void> {
    if (!this.options.initSSM && process.env.NO_PARAMETERS === 'true') {
      return
    }
    await initSSM()
  }

  async initLogger (): Promise<void> {
    if (!this.options.initLogger) {
      return
    }
    interceptors()
  }

  async initConfig (): Promise<void> {
    const globalRequestTimeout = container.isBound(TYPES.GlobalRequestTimeout)
      ? container.get<string>(TYPES.GlobalRequestTimeout)
      : this.options.globalRequestTimeout ?? String(1000 * 10)
    axios.defaults.timeout = parseInt(globalRequestTimeout, 10)
  }

  async initDB (): Promise<void> {
    if (!this.options.initDB) {
      return
    }
    if (process.env.USE_LOCAL_DDB) {
      const endpoint = process.env.USE_LOCAL_DDB.includes('http')
        ? process.env.USE_LOCAL_DDB
        : undefined
      this.useLocalDDB(endpoint)
      if (endpoint) {
        this.logger.debug(`dynamoose using local endpoint: ${endpoint}`)
      }
    }
  }

  async initFeatureFlags (): Promise<void> {
    // nothing
  }

  useLocalDDB (endpoint: string | undefined) {
    const ddb = new dynamoose.aws.sdk.DynamoDB({
      accessKeyId: 'test',
      secretAccessKey: 'test',
      region: 'us-east-2',
      endpoint: endpoint,
    })
    dynamoose.aws.ddb.set(ddb)
  }
}
