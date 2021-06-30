export const AWSFunctionContainerContextOptionsToken = Symbol.for(
  'AWSFunctionContainerContextOptions',
)

export interface AWSFunctionContainerContextOptions {
  initSSM: boolean
  initLogger: boolean
  initDB: boolean
  globalRequestTimeout: string
}

export const AWSFunctionContainerContextOptionsDefault: AWSFunctionContainerContextOptions = {
  initSSM: true,
  initLogger: true,
  initDB: true,
  globalRequestTimeout: String(1000 * 10),
}
