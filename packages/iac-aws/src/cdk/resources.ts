import _ from 'lodash'
import { Options, resourceName } from '#/app/options'

export const projectName = (options: Options) =>
  options.config?.app?.projectName ??
  options.config?.app?.name ??
  options.packageName ??
  _.kebabCase(`onhand-${options.config?.app?.type}`)

export const s3Arn = (bucketName: string) => `arn:aws:s3:::${bucketName}`

export const getS3StackName = (options: Options) =>
  resourceName(options, `${options.config?.app?.type} assets`, false, 'kebab')

export const getAssetsBucketName = (options: Options) =>
  resourceName(options, `${options.config?.app?.type} assets`)

export const getReleasesBucketName = (options: Options) =>
  resourceName(options, `${options.config?.app?.type} releases`, true, 'kebab')

export const getMainStackName = (options: Options) =>
  resourceName(options, options.config?.app?.type!, false, 'kebab')

export const getFunctionsStackName = (options: Options) =>
  resourceName(options, 'functions', false, 'kebab')

export const getApiGatewayStackName = (options: Options) =>
  resourceName(options, 'apigateway', false, 'kebab')

export const getDeployStackName = (options: Options) =>
  resourceName(options, `${options.config?.app?.type} deploy`, false, 'kebab')

export const getCloudFormationStackName = (options: Options) =>
  resourceName(options, 'cloudfront', false, 'kebab')

export const getCFDistributionName = (options: Options) =>
  resourceName(options, 'site distribution')

export const getCFDistributionId = (options: Options) =>
  resourceName(options, 'site distributionId')

export const getCFDistributionDN = (options: Options) =>
  resourceName(options, 'site distributionDomainName')

export const getCFOriginAccessIdentity = (options: Options) =>
  resourceName(options, 'site distribution-oai')

export const getSiteDeployment = (options: Options) =>
  resourceName(options, 'site deployment')
