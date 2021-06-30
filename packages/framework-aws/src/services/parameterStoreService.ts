import fs from 'fs'
import path from 'path'
import os from 'os'
import { injectable, inject } from 'inversify'
import {
  IInMemoryCacheServiceToken,
  IInMemoryCacheService,
} from '@onhand/business/#/services/iInMemoryCacheService'
import { IParameterStoreService } from '@onhand/business-aws/#/services'
import { ILogger, LogToken } from '@onhand/business/#/modules/logger'
import { SSM } from 'aws-sdk'

@injectable()
export class ParameterStoreService implements IParameterStoreService {
  @inject(IInMemoryCacheServiceToken)
  private readonly cache!: IInMemoryCacheService

  private readonly ssm!: SSM
  private readonly offline: boolean = false
  private readonly offlineParameters!: Array<{
    Version: number
    Type: 'String'
    Name: string
    Value: string
  }>

  constructor (@inject(LogToken) private readonly logger: ILogger) {
    try {
      if (process.env.NO_PARAMETERS === 'true') {
        return
      }
      let ssmOptions: SSM.Types.ClientConfiguration | undefined
      if (process.env.PARAMETER_STORE_ENDPOINT) {
        ssmOptions = {
          accessKeyId: 'test',
          secretAccessKey: 'test',
          region: 'us-east-2',
          endpoint: process.env.PARAMETER_STORE_ENDPOINT,
        }
      }
      this.ssm = new SSM(ssmOptions)

      if (process.env.OFFLINE_PARAMETERS) {
        this.offline = true
        const offlineParameters = fs.readFileSync(
          path.resolve(process.cwd(), process.env.OFFLINE_PARAMETERS),
        )

        this.offlineParameters = String(offlineParameters)
          .split(os.EOL)
          .filter(p => !!p)
          .map(p => {
            const param = p.split('=')
            return {
              Version: 1,
              Type: 'String',
              Name: param[0],
              Value: param[1],
            }
          })
      }
    } catch (err) {
      this.logger.error(err)
    }
  }

  has (key: string): boolean {
    return this.cache.has(key)
  }

  async get (
    ...keys: string[]
  ): Promise<Array<string | string[]> | string | string[]> {
    const params = await this.getAll(keys)
    if (keys.length === 1) {
      return params.map(p => p.value).find(_ => true)!
    }
    return params.map(p => p.value)
  }

  async getOne (key: string, propagateError = true): Promise<string | string[]> {
    if (this.cache.has(key)) {
      return this.cache.get<string>(key)!
    }
    if (this.offline) {
      const value = this.getLocal(key)
      if (value) {
        return value
      }
    }
    const params = {
      Name: key,
      WithDecryption: true,
    }
    const { Parameter, $response } = await this.ssm
      .getParameter(params)
      .promise()
      .catch(err => {
        this.logger.error('GETTING PARAMETER STORE - FAILED:', key)
        throw err
      })
    const parameterValue = Parameter?.Value
    if (propagateError && $response.error) {
      this.logger.error('GETTING PARAMETER STORE - FAILED:', key)
      throw $response.error
    }
    if (Parameter?.Type === 'StringList') {
      const value = (parameterValue ?? '').split(',')
      return value
    } else {
      if (!parameterValue) {
        this.logger.error('GETTING PARAMETER STORE - INVALID:', key)
      }
      return parameterValue ?? ''
    }
  }

  async getAll (
    keys: string[],
    propagateError = true,
  ): Promise<Array<{ name: string, value: string | string[] }>> {
    if (this.offline) {
      const parameters: Array<{ name: string, value: string | string[] }> = []
      for (const key of keys) {
        const param = await this.getOne(key, propagateError)
        parameters.push({ name: key, value: param })
      }
      return parameters
    }
    this.logger.debug('GETTING PARAMETER STORES', keys)
    const params = {
      Names: keys,
      WithDecryption: true,
    }
    const { Parameters, $response, InvalidParameters } = await this.ssm
      .getParameters(params)
      .promise()
      .catch(err => {
        this.logger.error('GETTING PARAMETER STORE - FAILED:', keys)
        throw err
      })
    if (propagateError) {
      if ($response.error) {
        throw $response.error
      }
      if (InvalidParameters?.length) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw InvalidParameters
      }
    }
    return Parameters!.map(param => {
      let value: string | string[] = param.Value!
      if (param.Type === 'StringList') {
        value = (value || '').split(',')
      }
      return { name: param.Name!, value: value }
    })
  }

  private getLocal (key: string): string | string[] {
    const parameter = this.offlineParameters.find(p => p.Name === key)
    if (parameter) {
      const value = parameter.Value
      if (value.includes(',')) {
        return value.split(',')
      } else {
        return value
      }
    } else {
      return ''
    }
  }
}
