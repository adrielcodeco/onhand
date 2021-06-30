/* eslint-disable no-new */
import * as core from '@aws-cdk/core'
import { Container } from 'typedi'
import { Options } from '#/app/options'
import { S3Stack } from '#/cdk/site/stacks/s3Stack'
import { SiteStack } from '#/cdk/site/stacks/siteStack'

function initApp () {
  const app = new core.App()

  let options: Options | undefined
  let promote: boolean

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

  if (!options) {
    throw new Error('invalid options')
  }

  return { app, promote, options }
}

function init () {
  try {
    const { app, options, promote } = initApp()
    new S3Stack(app, options, promote)
    new SiteStack(app, options)
    app.synth()
  } catch (err) {
    console.error(err)
  }
}

init()
