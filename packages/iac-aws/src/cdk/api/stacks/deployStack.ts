/* eslint-disable no-new */
import _ from 'lodash'
import * as cdk from '@aws-cdk/core'
import { Options } from '#/app/options'
import { customResource, functionFromName } from '../customResource'
import { getDeployStackName } from '#/cdk/resources'

export class DeployStack extends cdk.NestedStack {
  constructor (scope: cdk.Construct, private readonly options: Options) {
    super(scope, getDeployStackName(options))
    this.sow()
  }

  private sow () {
    const operationName = 'onhand-seed-function'
    const func = functionFromName(
      this,
      operationName,
      this.options,
      this.options.stage,
    )
    customResource(this, _.camelCase(operationName), func, this.options)
  }
}
