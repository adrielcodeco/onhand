import { inject, injectable } from 'inversify'
import { get } from 'lodash'
import { container } from '@onhand/business/#/ioc/container'
import { ILogger, LogToken } from '@onhand/business/#/modules/logger'
import { TYPES } from '@onhand/business/#/ioc/types'
import {
  AWSFunctionHandleContextOptions,
  AWSFunctionHandleContextOptionsToken,
} from '#/infrastructure/awsFunctionHandleContextOptions'
import {
  ISessionService,
  ISessionServiceToken,
} from '@onhand/business/#/services/iSessionService'
import { initSSM } from '#/infrastructure/initSSM'
import { Unauthorized } from '@onhand/jsend'

@injectable()
export class AWSFunctionHandleContext<E> {
  @inject(LogToken)
  private readonly logger!: ILogger

  @inject(AWSFunctionHandleContextOptionsToken)
  readonly options!: AWSFunctionHandleContextOptions

  async init (event: E): Promise<void> {
    this.logger.debug('initializing containerContext', this.options)
    await this.initRequestContext(event)
    await this.ensureSSM()
  }

  async initRequestContext (event: E): Promise<void> {
    if (!event) {
      return
    }
    const logger = container.get<ILogger>(LogToken)
    const session = container.get<ISessionService>(ISessionServiceToken)
    const requestId = get(event, 'requestContext.requestId')
    const userIdentifier = get(
      event,
      'requestContext.authorizer.userIdentifier',
    )
    const userRole = get(event, 'requestContext.authorizer.userRole')
    const userScope = get(event, 'requestContext.authorizer.userScope')
    const userDeviceId = get(event, 'requestContext.authorizer.userDeviceId')
    if (requestId) {
      logger.debug(`requestId: ${String(requestId)}`)
      session.set(TYPES.RequestId, requestId)
    }
    if (userIdentifier) {
      logger.debug(`userIdentifier: ${String(userIdentifier)}`)
      session.set(TYPES.UserIdentifier, userIdentifier)
    } else if (this.options.authenticated) {
      throw Unauthorized()
    }
    if (userRole) {
      logger.debug(`userRole: ${String(userRole)}`)
      session.set(TYPES.UserRole, userRole)
    }
    if (userScope) {
      logger.debug(`userScope: ${String(userScope)}`)
      const session = container.get<ISessionService>(ISessionServiceToken)
      session.set(TYPES.UserScope, userScope)
    }
    if (userDeviceId) {
      logger.debug(`userDeviceId: ${String(userDeviceId)}`)
      const session = container.get<ISessionService>(ISessionServiceToken)
      session.set(TYPES.UserDeviceId, userDeviceId)
    }
  }

  async ensureSSM (): Promise<void> {
    if (this.options.initSSM) {
      await initSSM()
    }
  }
}
