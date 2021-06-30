import Ajv from 'ajv'
import axios from 'axios'
import moment from 'moment'
import colors from 'colors/safe'
import { plugin } from 'ajv-moment'
import addFormats from 'ajv-formats'
import { TestContext, APIConfig } from '#/lib/testContext'
import { Answer, prepareStep } from '#/lib/tsting-types'

export function preparedStep<T> (
  testContext: TestContext,
  step: prepareStep<T>,
) {
  return async () => {
    testContext.log.runner.info(`preparing.${step.name}`)
    try {
      const context = await step(testContext.context)
      if (context) {
        testContext.context = context
      }
      testContext.log.engine.success('good, continue ....')
    } catch (err) {
      testContext.log.engine.error(`failed preparing.${step.name}`)
      throw err
    }
  }
}

export function callingStep<T> (
  testContext: TestContext,
  api: (context?: T) => APIConfig,
) {
  return async () => {
    testContext.api = api(testContext.context)
    testContext.log.runner.info(
      `calling ${api.name} API on ${testContext.api.path}`,
    )
  }
}

export function ensuringThatStep<T, A extends any[]> (
  testContext: TestContext,
  step: (context: T, ...args: A) => Promise<T> | Promise<void>,
  ...args: A
) {
  return async () => {
    testContext.log.runner.info(`ensuring that ${step.name} and`)
    const context = await step(testContext.context, ...args)
    if (context) {
      testContext.context = context
    }
  }
}

export function andCallingStep<T> (
  testContext: TestContext,
  api: (context?: T) => APIConfig,
) {
  return async () => {
    testContext.api = api(testContext.context)
    if (testContext.currentRequest.failed) {
      testContext.log.engine.info("let's continue ....")
    } else {
      testContext.log.engine.success('good, continue ....')
    }
    testContext.currentRequest.clear()
    testContext.log.runner.info(
      `calling ${api.name} API on ${testContext.api.path}`,
    )
  }
}

export function withPathStep<T> (
  testContext: TestContext,
  key: string | RegExp,
  value: string | ((context?: T) => Promise<string>),
) {
  return async () => {
    if (!(typeof value === 'string')) {
      value = await value(testContext.context)
    }
    testContext.log.runner.info(`with param ${key.toString()} = ${value}`)
    testContext.currentRequest.params.set(key, value)
  }
}

function validateStatus<T> (
  testContext: TestContext,
  response: Answer<T>,
  tag?: string,
) {
  if (response?.statusCode) {
    testContext.log.runner.info(
      `should answer with ${JSON.stringify(response.statusCode)} as statusCode`,
    )
    if (testContext.currentRequest.response?.status !== response.statusCode) {
      testContext.log.engine.error(
        `OPS. The received statusCode: ${String(
          testContext.currentRequest.response?.status,
        )} is not the same as the expected statusCode: ${String(
          response.statusCode,
        )}`,
      )
      if (tag) {
        testContext.log.engine.info(`#TAG: ${tag}`)
        testContext.count.tags.push(tag)
      }
      testContext.count.fail++
      testContext.currentRequest.failed = true
    } else {
      testContext.count.success++
    }
  }
}

function validateContains<T> (
  testContext: TestContext,
  response: Answer<T>,
  tag?: string,
) {
  if (response?.contains) {
    testContext.log.runner.info(
      `should answer containing ${JSON.stringify(response.contains)}`,
    )
    if (
      !testContext.currentRequest.response?.data ||
      !JSON.stringify(testContext.currentRequest.response?.data).includes(
        response.contains,
      )
    ) {
      testContext.log.engine.error(
        `OPS. ${JSON.stringify(response.contains)} not found`,
      )
      testContext.log.engine.error(
        `response: ${JSON.stringify(
          testContext.currentRequest.response?.data,
        )}`,
      )
      if (tag) {
        testContext.log.engine.info(`#TAG: ${tag}`)
        testContext.count.tags.push(tag)
      }
      testContext.count.fail++
      testContext.currentRequest.failed = true
    } else {
      testContext.count.success++
    }
  }
}

function validateSchema<T> (
  testContext: TestContext,
  response: Answer<T>,
  tag?: string,
) {
  if (response?.schema) {
    testContext.log.runner.info(
      `should answer with schema ${JSON.stringify(response.schema)}`,
    )
    const ajv = new Ajv()
    addFormats(ajv)
    plugin({ ajv, moment })
    const validate = ajv.compile(response.schema)
    if (!validate(testContext.currentRequest.response?.data)) {
      testContext.log.engine.error('OPS. Invalid response schema')
      testContext.log.engine.error(
        `response: ${JSON.stringify(
          testContext.currentRequest.response?.data,
        )}`,
      )
      testContext.log.engine.error(`schema: ${JSON.stringify(response.schema)}`)
      testContext.log.engine.error(
        `validations: ${JSON.stringify(validate.errors)}`,
      )
      if (tag) {
        testContext.log.engine.info(`#TAG: ${tag}`)
        testContext.count.tags.push(tag)
      }
      testContext.count.fail++
      testContext.currentRequest.failed = true
    } else {
      testContext.count.success++
    }
  }
}

async function validateWith<T> (
  testContext: TestContext,
  response: Answer<T>,
  tag?: string,
) {
  if (response?.with) {
    testContext.log.runner.info(
      `should answer with ${JSON.stringify(response.with.name)}`,
    )

    const valid = await response?.with(
      testContext.context,
      testContext.currentRequest.response,
    )
    if (!valid) {
      testContext.log.engine.error('OPS. Invalid response')
      testContext.log.engine.error(
        `response: ${JSON.stringify(
          testContext.currentRequest.response?.data,
        )}`,
      )
      if (tag) {
        testContext.log.engine.info(`#TAG: ${tag}`)
        testContext.count.tags.push(tag)
      }
      testContext.count.fail++
      testContext.currentRequest.failed = true
    } else {
      testContext.count.success++
    }
  }
}

export function shouldAnswerStep<T> (
  testContext: TestContext,
  response: Answer<T>,
  tag?: string,
) {
  return async () => {
    let url = `${testContext.api.baseUrl}${testContext.api.path}`
    for (const [key, value] of testContext.currentRequest.params) {
      url = url.replace(key, value)
    }
    const result = await axios({
      method: testContext.api.method,
      url,
      headers: testContext.api.headers,
      data: testContext.currentRequest.body,
      validateStatus: () => true,
      timeout: 1000 * 60,
    })
    testContext.currentRequest.response = result
    validateStatus(testContext, response, tag)
    validateContains(testContext, response, tag)
    validateSchema(testContext, response, tag)
    await validateWith(testContext, response, tag)
  }
}

export function andAlsoStep<T> (
  testContext: TestContext,
  response: Answer<T>,
  tag?: string,
) {
  return async () => {
    validateStatus(testContext, response, tag)
    validateContains(testContext, response, tag)
    validateSchema(testContext, response, tag)
    await validateWith(testContext, response, tag)
  }
}

export function exitIfFailStep (testContext: TestContext) {
  return async () => {
    if (testContext.currentRequest.failed) {
      testContext.log.engine.error('leaving because last test failed')
      return Promise.reject(new Error('leaving because last test failed'))
    }
    return undefined
  }
}

export function soStep<C, C2> (
  testContext: TestContext,
  step: (response: any, context?: C) => Promise<void> | Promise<C2>,
) {
  return async () => {
    if (testContext.currentRequest.failed) {
      testContext.log.engine.info("let's continue ....")
    } else {
      testContext.log.engine.success('good, continue ....')
    }
    testContext.log.runner.info('executing pos-condition')
    const context = await step(
      testContext.currentRequest.response,
      testContext.context,
    )
    if (context) {
      testContext.context = context
    }
  }
}

export function andStep (testContext: TestContext) {
  return async () => {
    if (testContext.currentRequest.failed) {
      testContext.log.engine.info("let's continue ....")
    } else {
      testContext.log.engine.success('good, continue ....')
    }
    testContext.log.runner.info('and')
    testContext.currentRequest.clear()
  }
}

export async function doneStep (testContext: TestContext) {
  for (const step of testContext.steps) {
    try {
      await step()
    } catch (err) {
      console.error(err)
    }
  }
  if (testContext.currentRequest.failed) {
    testContext.log.engine.info("let's continue ....")
  } else {
    testContext.log.engine.success('good, continue ....')
  }
  testContext.log.runner.info('no more')
  const successes = testContext.count.success
  const failures = testContext.count.fail
  const total = successes + failures
  const tags = testContext.count.tags
  if (testContext.runner === 'self') {
    testContext.log.engine.info('test finished!!!')
    testContext.log.engine.info(
      `of ${total} tests, we had ${colors.green(
        `${successes} successes`,
      )} and ${colors.red(`${failures} failures`)}`,
    )
    if (testContext.count.tags.length) {
      testContext.log.engine.info('failed tags:')
      for (const tag of testContext.count.tags) {
        testContext.log.engine.error(tag)
      }
    }
  }
  return { successes, failures, total, tags }
}
