import { inspect } from 'util'
import { TestContext, APIConfig } from '#/lib/testContext'
import {
  Answer,
  prepareStep,
  prepareReturn,
  callingReturn,
  ensuringThatReturn,
  andCallingReturn,
  withPathReturn,
  withBodyReturn,
  shouldAnswerReturn,
  andAlsoReturn,
  exitIfFailReturn,
  soReturn,
  andReturn,
} from '#/lib/tsting-types'
import {
  preparedStep,
  callingStep,
  ensuringThatStep,
  andCallingStep,
  withPathStep,
  shouldAnswerStep,
  andAlsoStep,
  exitIfFailStep,
  soStep,
  andStep,
  doneStep,
} from '#/lib/tsting-steps'

export * from '#/lib/testContext'

export function prepared<T extends any> (
  step: prepareStep<T>,
): prepareReturn<T> {
  const testContext = new TestContext()
  testContext.steps.push(preparedStep(testContext, step))
  return {
    ensuringThat: $ensuringThat<T>(testContext),
    calling: $calling<T>(testContext),
  }
}

export function calling<T extends any> (
  api: (context?: T) => APIConfig,
): callingReturn<T> {
  const testContext = new TestContext()
  return $calling<T>(testContext)(api)
}

function $calling<T> (testContext: TestContext) {
  return (api: (context?: T) => APIConfig): callingReturn<T> => {
    testContext.steps.push(callingStep(testContext, api))
    return {
      withPath: $withPath<T>(testContext),
      withBody: $withBody<T>(testContext),
      shouldAnswer: $shouldAnswer<T>(testContext),
    }
  }
}

function $ensuringThat<T> (testContext: TestContext) {
  return <A extends any[]>(
    step: (context: T, ...args: A) => Promise<T> | Promise<void>,
    ...args: A
  ): ensuringThatReturn<T> => {
    testContext.steps.push(ensuringThatStep(testContext, step, ...args))
    return {
      calling: $calling<T>(testContext),
      andCalling: $andCalling<T>(testContext),
      withPath: $withPath<T>(testContext),
    }
  }
}

function $andCalling<T> (testContext: TestContext) {
  return (api: (context?: T) => APIConfig): andCallingReturn<T> => {
    testContext.steps.push(andCallingStep(testContext, api))
    return {
      withPath: $withPath<T>(testContext),
      withBody: $withBody<T>(testContext),
      shouldAnswer: $shouldAnswer<T>(testContext),
    }
  }
}

function $withPath<T> (testContext: TestContext) {
  return (
    key: string | RegExp,
    value: string | ((context?: T) => Promise<string>),
  ): withPathReturn<T> => {
    testContext.steps.push(withPathStep(testContext, key, value))
    return {
      withBody: $withBody<T>(testContext),
      shouldAnswer: $shouldAnswer<T>(testContext),
    }
  }
}

function $withBody<T> (testContext: TestContext) {
  return (body: any): withBodyReturn<T> => {
    const step: () => Promise<void> = async () => {
      testContext.log.runner.info(`with body ${JSON.stringify(body)}`)
      testContext.currentRequest.body = body
    }
    testContext.steps.push(step)
    return {
      shouldAnswer: $shouldAnswer<T>(testContext),
    }
  }
}

function $shouldAnswer<T> (testContext: TestContext) {
  return (response: Answer<T>, tag?: string): shouldAnswerReturn<T> => {
    if (!response) {
      throw new Error('response cannot be null')
    }
    testContext.steps.push(shouldAnswerStep(testContext, response, tag))
    return {
      andAlso: $andAlso<T>(testContext),
      and: $and<T>(testContext),
      andCalling: $andCalling<T>(testContext),
      exitIfFail: $exitIfFail<T>(testContext),
      so: $so<T>(testContext),
      done: $done(testContext),
    }
  }
}

function $andAlso<T> (testContext: TestContext) {
  return (response: Answer<T>, tag?: string): andAlsoReturn<T> => {
    if (!response) {
      throw new Error('response cannot be null')
    }
    testContext.steps.push(andAlsoStep(testContext, response, tag))
    return {
      andAlso: $andAlso<T>(testContext),
      and: $and<T>(testContext),
      andCalling: $andCalling<T>(testContext),
      exitIfFail: $exitIfFail<T>(testContext),
      so: $so<T>(testContext),
      done: $done(testContext),
    }
  }
}

function $exitIfFail<T> (testContext: TestContext) {
  return (): exitIfFailReturn<T> => {
    testContext.steps.push(exitIfFailStep(testContext))
    return {
      and: $and<T>(testContext),
      andCalling: $andCalling<T>(testContext),
      so: $so<T>(testContext),
      done: $done(testContext),
    }
  }
}

function $so<C> (testContext: TestContext) {
  return <C2>(
    step: (response: any, context?: C) => Promise<void> | Promise<C2>,
  ): soReturn<C2> => {
    testContext.steps.push(soStep(testContext, step))
    return {
      and: $and<C2>(testContext),
      andCalling: $andCalling<C2>(testContext),
      done: $done(testContext),
    }
  }
}

function $and<T> (testContext: TestContext) {
  return (): andReturn<T> => {
    testContext.steps.push(andStep(testContext))
    return {
      withPath: $withPath<T>(testContext),
      ensuringThat: $ensuringThat<T>(testContext),
      withBody: $withBody<T>(testContext),
    }
  }
}

function $done (testContext: TestContext) {
  return () => {
    doneStep(testContext)
      .then((statistics: any) => {
        if (process.send) {
          process.send({ action: 'exit', statistics })
        }
      })
      .catch(err => {
        if (process.send) {
          process.send({ action: 'exit', err: inspect(err, false, 2, false) })
        }
      })
  }
}
