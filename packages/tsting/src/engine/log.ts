import { EOL } from 'os'
import { isEmpty } from 'lodash'
import { inspect } from 'util'
import {
  createLogger,
  Logger as LoggerClass,
  format,
  transports as tp,
} from 'winston'
import * as Transport from 'winston-transport'
import colors from 'colors/safe'

export class Logger {
  private readonly logger!: LoggerClass

  constructor () {
    const transports: Transport[] = [
      new tp.Console({
        handleExceptions: true,
      }),
    ]
    const { combine, metadata, printf } = format
    this.logger = createLogger({
      level: process.env.LOG_LEVEL ?? 'info',
      format: combine(
        metadata(),
        printf(info => {
          let result = ''
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

  public log (msg: string) {
    this.logger.info(msg)
  }

  public engine = {
    info: (log: string) => this.logger.info(`@onHand::tsting - ${log}`),
    success: (log: string) =>
      this.logger.info(`@onHand::tsting - ${colors.green(log)}`),
    error: (log: string) =>
      this.logger.error(`@onHand::tsting - ${colors.red(log)}`),
  }

  public runner = {
    info: (log: string) => this.logger.info(`you - ${colors.blue(log)}`),
  }
}
