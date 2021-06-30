/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path'
import glob from 'glob'
import colors from 'colors/safe'
import { Config } from '#/engine/onhandFile'
import { Logger } from '#/engine/log'
import { testRunner, Statistics } from '#/engine/testRunner'

export class Engine {
  private readonly setupContext: any = {}
  private readonly logger: Logger
  private readonly statistics: Map<string, Statistics> = new Map()

  constructor (private readonly config: Config) {
    this.logger = new Logger()
  }

  async list () {
    const tests = this.searchTests()
    if (tests.length > 0) {
      this.logger.engine.info('found APIs....')
    } else {
      this.logger.engine.info('APIs not found....')
    }
    for (const test of tests) {
      const api = path.basename(test).replace('.test.ts', '')
      this.logger.engine.info(api)
    }
  }

  async start (apis?: string[], replay?: number) {
    const tests = this.searchTests(apis)
    if (tests.length) {
      await this.setup()
      try {
        for (let r = 0; r < (replay ?? 1); r++) {
          for (const test of tests) {
            try {
              await this.run(test).catch(console.error)
            } catch (err) {
              if (this.config.bail) {
                throw err
              } else {
                console.error(err)
              }
            }
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    const success = await this.output()
    if (tests.length) {
      await this.teardown()
    }

    if (!success) {
      throw 'The test failed, review the logs to fix it'
    }
  }

  async setup (): Promise<void> {
    if (this.config.setup) {
      this.logger.engine.info('running setup step...')
      const setupFile = path.resolve(this.config.cwd, this.config.setup)
      const { setup } = await import(setupFile)
      await (setup as (context: any) => Promise<void>)(this.setupContext)
    }
  }

  searchTests (apis?: string[]): string[] {
    let tests: string[] = []
    for (const regex of this.config.testRegex ?? ['tests/**/*.test.[tj]s']) {
      const files = glob.sync(regex, {
        cwd: this.config.cwd,
        ignore: this.config.ignore,
        absolute: true,
      })
      tests = tests.concat(
        apis
          ? files.filter(f =>
            apis.find(api => new RegExp(api, 'gi').test(path.basename(f))),
          )
          : files,
      )
    }
    return tests
  }

  async run (testPath: string): Promise<void> {
    this.logHDiv()
    const api = path.basename(testPath).replace('.test.ts', '')
    this.logger.engine.info(`Starting test for ${api} API ....`)
    this.logHDiv()
    const statistics = await testRunner(testPath, this.config)
    this.statistics.set(api, statistics)
  }

  async output () {
    this.logHDiv()
    let totalSuccesses = 0
    let totalFailures = 0
    for (const statistic of this.statistics.values()) {
      totalSuccesses += statistic.successes
      totalFailures += statistic.failures
    }
    const total = totalSuccesses + totalFailures
    this.logger.engine.info('test finished!!!')
    const apis = Array.from(this.statistics.keys()).length
    this.logger.engine.info(`${apis > 1 ? 'were' : 'was'} ${apis} APIs`)
    this.logger.engine.info(
      `of ${total} tests, we had ${colors.green(
        `${totalSuccesses} successes`,
      )} and ${colors.red(`${totalFailures} failures`)}`,
    )
    for (const [api, statistic] of this.statistics) {
      const successes = statistic.successes
      const failures = statistic.failures
      const total = successes + failures
      if (!failures) {
        continue
      }
      this.logHDiv()
      this.logger.engine.info(
        `for ${String(api)} API, of ${total} tests, we had ${colors.green(
          `${successes} successes`,
        )} and ${colors.red(`${failures} failures`)}`,
      )
      if (statistic.tags.length) {
        this.logger.engine.info('failed tags:')
        for (const tag of statistic.tags) {
          this.logger.engine.info(` ${colors.red(tag)}`)
        }
      }
    }
    this.logHDiv()

    if (this.config.report) {
      await this.createJUnitTestResultXml()
    }

    return totalFailures === 0
  }

  async teardown (): Promise<void> {
    if (this.config.teardown) {
      this.logger.engine.info('running teardown step...')
      const teardownFile = path.resolve(this.config.cwd, this.config.teardown)
      const { teardown } = await import(teardownFile)
      await (teardown as (context: any) => Promise<void>)(this.setupContext)
    }
  }

  private logHDiv () {
    this.logger.log(
      '#########################################################################################',
    )
  }

  private async createJUnitTestResultXml () {
    const builder = require('junit-report-builder')
    const suite = builder.testSuite().name('My suite')

    suite.testCase().className('my.test.Class').name('My first test')

    suite.testCase().className('my.test.Class').name('My second test').failure()

    builder.writeTo('test-report.xml')
  }
}
