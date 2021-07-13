import 'reflect-metadata'
import ':/framework/ioc'
import { container } from '@onhand/common-business/#/ioc/container'
// eslint-disable-next-line max-len
import { AWSFunctionContainerContext } from '@onhand/common-framework-aws/#/infrastructure/awsFunctionContainerContext'

// eslint-disable-next-line @typescript-eslint/require-await
export async function config () {
  if (process.env.USE_LOCAL_DDB) {
    const containerContext = container.resolve(AWSFunctionContainerContext)
    containerContext.useLocalDDB(process.env.USE_LOCAL_DDB)
  }
}
