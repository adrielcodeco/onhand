import { SdkProvider } from 'aws-cdk/lib/api/aws-auth'
import * as settings from 'aws-cdk/lib/settings'
import { Arguments, Configuration, Command } from 'aws-cdk/lib/settings'
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments'
import { StackActivityProgress } from 'aws-cdk/lib/api/util/cloudformation/stack-activity-monitor'
import { CloudExecutable } from 'aws-cdk/lib/api/cxapp/cloud-executable'
import { execProgram } from 'aws-cdk/lib/api/cxapp/exec'
import { CdkToolkit } from 'aws-cdk/lib/cdk-toolkit'
import { RequireApproval } from 'aws-cdk/lib/diff'
import { Bootstrapper } from 'aws-cdk/lib/api/bootstrap'
import { ToolkitInfo } from 'aws-cdk/lib/api/toolkit-info'
import { Options } from '#/app/options'
import { checkIfBucketExists, uploadAssets } from './assets'
import { getS3StackName, getMainStackName } from '#/cdk/resources'
import debug from 'debug'

const log = debug('onhand:iac')

export async function cdk (options: Options, promote: boolean, functions: any) {
  const output = options.config?.deploy?.outputFolder ?? '.out/cdk'
  const argv: Arguments = {
    _: [Command.DEPLOY],
    region: options.awsRegion,
    output,
    // eslint-disable-next-line node/no-path-concat
    app: `node ${__dirname}/${options.config?.app?.type}/importer.js`,
    context: [
      '@aws-cdk/core:newStyleStackSynthesis=true',
      '@aws-cdk/core:enableStackNameDuplicates=true',
      'aws-cdk:enableDiffNoFail=true',
      'options=' + JSON.stringify(options),
      'promote=' + JSON.stringify(!!promote),
      'functions=' + JSON.stringify(functions),
    ],
  }
  ;(settings as any).PROJECT_CONFIG = `${output}/cdk.json`
  ;(settings as any).PROJECT_CONTEXT = `${output}/cdk.context.json`
  log('cdk argv: %O', argv)
  const configuration = new Configuration({
    commandLineArguments: argv,
    readUserContext: false,
  })
  await configuration.load()

  const profile = options.awsProfile ?? configuration.settings.get(['profile'])
  log('cdk profile: %s', profile)
  const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
    profile,
    ...{ localstack: false },
  })

  const cloudFormation = new CloudFormationDeployments({ sdkProvider })
  log('CloudFormationDeployments created')
  const cloudExecutable = new CloudExecutable({
    configuration,
    sdkProvider,
    synthesizer: execProgram,
  })
  log('CloudExecutable created')
  const cli = new CdkToolkit({
    cloudExecutable,
    cloudFormation,
    verbose: options.verbose,
    ignoreErrors: options.ignoreErrors,
    strict: true,
    configuration,
    sdkProvider,
  })
  log('CdkToolkit created')
  const bootstrapper = new Bootstrapper({ source: 'default' })
  log('Bootstrapper created')
  const toolkitStackName = ToolkitInfo.determineName(
    configuration.settings.get(['toolkitStackName']),
  )
  log('toolkitStackName: %O', toolkitStackName)
  await cli.bootstrap([], bootstrapper, {
    toolkitStackName,
    tags: configuration.settings.get(['tags']),
    parameters: {
      bucketName: configuration.settings.get(['toolkitBucket', 'bucketName']),
      kmsKeyId: configuration.settings.get(['toolkitBucket', 'kmsKeyId']),
    },
  })
  log('bootstrap called')
  return {
    configuration,
    sdkProvider,
    cli,
  }
}

export async function deployStacks (args: {
  cli: CdkToolkit
  configuration: Configuration
  sdkProvider: SdkProvider
  options: Options
  promote: boolean
}) {
  const { cli, configuration, options, sdkProvider, promote } = args

  const toolkitStackName = ToolkitInfo.determineName(
    configuration.settings.get(['toolkitStackName']),
  )
  log('toolkitStackName: %O', toolkitStackName)
  if (!(options.config?.app?.type === 'api' && promote)) {
    log('s3 deployment')
    const exists = await checkIfBucketExists(
      options,
      await (sdkProvider as any).defaultCredentials(),
    )
    log('checkIfBucketExists: %s', exists)
    if (!exists) {
      await cli.deploy({
        toolkitStackName,
        selector: { patterns: [getS3StackName(options)] },
        requireApproval: RequireApproval.Never,
        progress: StackActivityProgress.EVENTS,
        ci: true,
      })
      log('cli.deploy called')
    }
  }

  if (!promote) {
    log('Assets upload')
    await uploadAssets(options, await (sdkProvider as any).defaultCredentials())
  }

  log('main stack deployment')
  await cli.deploy({
    toolkitStackName,
    selector: { patterns: [getMainStackName(options)] },
    requireApproval: RequireApproval.Never,
    progress: StackActivityProgress.EVENTS,
    ci: true,
  })
}
