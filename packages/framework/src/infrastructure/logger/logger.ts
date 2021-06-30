import { EOL } from 'os'
import { isEmpty } from 'lodash'
import { inspect } from 'util'
import { ILogger } from '@onhand/business/#/modules/logger'
import { createLogger, Logger, format } from 'winston'
import * as Transport from 'winston-transport'

export class LoggerClass implements ILogger {
  private readonly logger!: Logger

  constructor (transports: Transport[]) {
    const { combine, metadata, printf } = format
    this.logger = createLogger({
      level: process.env.LOG_LEVEL ?? 'info',
      format: combine(
        metadata(),
        printf(info => {
          let result = `${info.level.toUpperCase()}: `
          // tslint:disable-next-line: strict-type-predicates
          if (typeof info.message === 'string') {
            result += info.message
          } else {
            result += inspect(info.message, false, 5)
          }
          if (info.metadata && !isEmpty(info.metadata)) {
            result += EOL
            if (typeof info.metadata === 'string') {
              result += info.metadata
            } else {
              result += inspect(info.metadata, false, 5)
            }
          }
          return result
        }),
      ),
      transports,
      exitOnError: false,
    })
  }

  public log (log: any, context?: any, level?: string): void {
    if ((level ?? 'info') in this.logger) {
      const logger = this.logger as any
      const func = logger[level ?? 'info'] as (log: any, context?: any) => void
      func(log, context)
    }
  }

  public debug (log: any, context?: any): void {
    this.logger.debug(log, context)
  }

  public info (log: any, context?: any): void {
    this.logger.info(log, context)
  }

  public notice (log: any, context?: any): void {
    this.logger.notice(log, context)
  }

  public warning (log: any, context?: any): void {
    this.logger.warn(log, context)
  }

  public error (log: any, context?: any): void {
    this.logger.error(log, context)
  }

  public crit (log: any, context?: any): void {
    this.logger.crit(log, context)
  }

  public alert (log: any, context?: any): void {
    this.logger.alert(log, context)
  }

  public emerg (log: any, context?: any): void {
    this.logger.emerg(log, context)
  }
}
