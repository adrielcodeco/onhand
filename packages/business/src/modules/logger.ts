export interface ILogger {
  log: (log: any, context?: any, level?: string) => void
  debug: (log: any, context?: any) => void
  info: (log: any, context?: any) => void
  notice: (log: any, context?: any) => void
  warning: (log: any, context?: any) => void
  error: (log: any, context?: any) => void
  crit: (log: any, context?: any) => void
  alert: (log: any, context?: any) => void
  emerg: (log: any, context?: any) => void
}

export const LogToken = Symbol.for('ILogger')
