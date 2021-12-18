/* eslint-disable no-new */
import * as core from '@aws-cdk/core'
import { Container } from 'typedi'
import { Options } from '#/app/options'
import { S3Stack } from '#/cdk/api/stacks/s3Stack'
import { ApiStack } from '#/cdk/api/stacks/apiStack'

function initApp () {
  const app = new core.App()

  let options: Options | undefined
  let promote: boolean
  let functions: any

  if (!process.env.CDK_DEFAULT_ACCOUNT) {
    process.env.CDK_DEFAULT_ACCOUNT = app.account
  }

  if (!process.env.CDK_DEFAULT_REGION) {
    process.env.CDK_DEFAULT_REGION = app.region
  }

  if (!Container.has('promote')) {
    const promoteString = app.node.tryGetContext('promote')
    promote = promoteString === 'true'
    Container.set('promote', promote)
  } else {
    promote = Container.get<boolean>('promote')
  }

  if (!Container.has('options')) {
    const optionsString = app.node.tryGetContext('options')
    if (optionsString) {
      options = JSON.parse(optionsString) as Options
      options.awsAccount = process.env.CDK_DEFAULT_ACCOUNT
      options.awsRegion = process.env.CDK_DEFAULT_REGION
      Container.set('options', options)
    }
  } else {
    options = Container.get<Options>('options')
    options.awsAccount = process.env.CDK_DEFAULT_ACCOUNT
    options.awsRegion = process.env.CDK_DEFAULT_REGION
  }

  if (!Container.has('functions')) {
    const functionsString = app.node.tryGetContext('functions')
    functions = JSON.parse(functionsString)
    Container.set('functions', functions)
  } else {
    functions = Container.get('functions')
  }

  if (!options) {
    throw new Error('invalid options')
  }

  return { app, promote, options }
}

function init () {
  try {
    const { app } = initApp()
    S3Stack.init(app)
    ApiStack.init(app)
    app.synth()
  } catch (err) {
    console.error(err)
  }
}

init()
