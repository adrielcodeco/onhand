import { APIConfig } from '#/lib/testContext'

export type Answer<T> = {
  statusCode?: number
  contains?: string
  schema?: any
  with?: (context?: T, response?: any) => Promise<boolean>
}

export type prepareStep<T extends any> = (context?: T) => Promise<T>
export type prepareReturn<T> = {
  ensuringThat: EnsuringThat<T>
  calling: Calling<T>
}

export type callingReturn<T> = {
  withPath: WithPath<T>
  withBody: WithBody<T>
  shouldAnswer: ShouldAnswer<T>
}
export type Calling<T> = (api: (context?: T) => APIConfig) => callingReturn<T>

export type ensuringThatReturn<T> = {
  calling: Calling<T>
  andCalling: AndCalling<T>
  withPath: WithPath<T>
}
export type EnsuringThat<T> = <A extends any[]>(
  step: (context: T, ...args: A) => Promise<T> | Promise<void>,
  ...args: A
) => ensuringThatReturn<T>

export type andCallingReturn<T> = {
  withPath: WithPath<T>
  withBody: WithBody<T>
  shouldAnswer: ShouldAnswer<T>
}
export type AndCalling<T> = (
  api: (context?: T) => APIConfig,
) => andCallingReturn<T>

export type withPathReturn<T> = {
  shouldAnswer: ShouldAnswer<T>
  withBody: WithBody<T>
}
export type WithPath<T> = (
  key: string | RegExp,
  value: string | ((context?: T) => Promise<string>),
) => withPathReturn<T>

export type withBodyReturn<T> = { shouldAnswer: ShouldAnswer<T> }
export type WithBody<T> = (body: any) => withBodyReturn<T>

export type shouldAnswerReturn<T> = {
  andAlso: AndAlso<T>
  and: And<T>
  andCalling: AndCalling<T>
  exitIfFail: ExitIfFail<T>
  so: So<T>
  done: Done
}
export type ShouldAnswer<T> = (
  response: Answer<T>,
  tag?: string,
) => shouldAnswerReturn<T>

export type andAlsoReturn<T> = {
  andAlso: AndAlso<T>
  and: And<T>
  andCalling: AndCalling<T>
  exitIfFail: ExitIfFail<T>
  so: So<T>
  done: Done
}
export type AndAlso<T> = (response: Answer<T>, tag?: string) => andAlsoReturn<T>

export type exitIfFailReturn<T> = {
  and: And<T>
  andCalling: AndCalling<T>
  so: So<T>
  done: Done
}
export type ExitIfFail<T> = () => exitIfFailReturn<T>

export type soReturn<T> = { and: And<T>, andCalling: AndCalling<T>, done: Done }
export type So<C> = <C2>(
  step: (response: any, context?: C) => Promise<void> | Promise<C2>,
) => soReturn<C2>

export type andReturn<T> = {
  ensuringThat: EnsuringThat<T>
  withPath: WithPath<T>
  withBody: WithBody<T>
}
export type And<T> = () => andReturn<T>

export type Done = () => void
