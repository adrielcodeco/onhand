/* eslint-disable @typescript-eslint/no-var-requires */
import { injectable } from 'inversify'
import { transports } from 'winston'
import { LoggerClass } from './logger'

const { LEVEL, MESSAGE } = require('triple-beam')

@injectable()
export class ConsoleLogger extends LoggerClass {
  constructor () {
    super([
      new transports.Console({
        handleExceptions: true,
        log (info, callback) {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const self: any = this
          setImmediate(() => self.emit('logged', info))

          if (self.stderrLevels[info[LEVEL]]) {
            console.error(info[MESSAGE])

            if (callback) {
              callback()
            }
            return
          }

          console.log(info[MESSAGE])

          if (callback) {
            callback()
          }
        },
      }),
    ])
  }
}
