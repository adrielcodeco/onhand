export const AWSFunctionHandleContextOptionsToken = Symbol.for(
  'AWSFunctionHandleContextOptions',
)

export interface AWSFunctionHandleContextOptions {
  initSSM: boolean
  authenticated: boolean
}

export const AWSFunctionHandleContextOptionsDefault: AWSFunctionHandleContextOptions = {
  initSSM: true,
  authenticated: false,
}
