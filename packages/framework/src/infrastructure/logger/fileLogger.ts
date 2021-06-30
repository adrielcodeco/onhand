import path from 'path'
import { injectable } from 'inversify'
import { transports } from 'winston'
import { LoggerClass } from './logger'

@injectable()
export class FileLogger extends LoggerClass {
  constructor () {
    super([
      new transports.File({
        handleExceptions: true,
        filename: path.resolve(process.cwd(), `.logs/${process.pid}`),
      }),
    ])
  }
}
