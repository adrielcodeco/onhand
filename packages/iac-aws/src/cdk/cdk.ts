import { SdkProvider } from 'aws-cdk/lib/api/aws-auth'
import { Configuration, Arguments, Command } from 'aws-cdk/lib/settings'
import { CloudFormationDeployments } from 'aws-cdk/lib/api/cloudformation-deployments'
import { StackActivityProgress } from 'aws-cdk/lib/api/util/cloudformation/stack-activity-monitor'
import { CloudExecutable } from 'aws-cdk/lib/api/cxapp/cloud-executable'
import { execProgram } from 'aws-cdk/lib/api/cxapp/exec'
import { CdkToolkit } from 'aws-cdk/lib/cdk-toolkit'
import { RequireApproval } from 'aws-cdk/lib/diff'
import { Bootstrapper, ToolkitInfo } from 'aws-cdk/lib'
import { Options } from '#/app/options'
import { uploadAssets } from './uploadAssets'
import { getS3StackName, getMainStackName } from '#/cdk/resources'

export async function cdk (options: Options, promote: boolean, functions: any) {
  const argv: Arguments = {
    _: [Command.DEPLOY],
    region: options.awsRegion,
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
  const configuration = new Configuration({
    commandLineArguments: argv,
    readUserContext: false,
  })
  await configuration.load()

  const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
    profile: options.awsProfile ?? configuration.settings.get(['profile']),
    ...{ localstack: false },
  })

  const cloudFormation = new CloudFormationDeployments({ sdkProvider })

  const cloudExecutable = new CloudExecutable({
    configuration,
    sdkProvider,
    synthesizer: execProgram,
  })

  const cli = new CdkToolkit({
    cloudExecutable,
    cloudFormation,
    verbose: options.verbose,
    ignoreErrors: options.ignoreErrors,
    strict: true,
    configuration,
    sdkProvider,
  })

  const bootstrapper = new Bootstrapper({ source: 'default' })

  const toolkitStackName = ToolkitInfo.determineName(
    configuration.settings.get(['toolkitStackName']),
  )

  await cli.bootstrap([], bootstrapper, {
    toolkitStackName,
    tags: configuration.settings.get(['tags']),
    parameters: {
      bucketName: configuration.settings.get(['toolkitBucket', 'bucketName']),
      kmsKeyId: configuration.settings.get(['toolkitBucket', 'kmsKeyId']),
    },
  })

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

  if (!(options.config?.app?.type === 'api' && promote)) {
    await cli.deploy({
      toolkitStackName,
      selector: { patterns: [getS3StackName(options)] },
      requireApproval: RequireApproval.Never,
      progress: StackActivityProgress.EVENTS,
      ci: true,
    })
  }

  if (!promote) {
    await uploadAssets(options, await (sdkProvider as any).defaultCredentials())
  }

  await cli.deploy({
    toolkitStackName,
    selector: { patterns: [getMainStackName(options)] },
    requireApproval: RequireApproval.Never,
    progress: StackActivityProgress.EVENTS,
    ci: true,
  })
}
