import _ from 'lodash'
import { Container } from 'typedi'
import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'
import { Options } from '#/app/options'
import { projectName, getReleasesBucketName, s3Arn } from '#/cdk/resources'

class StackTools {
  public readonly scope: cdk.Construct
  public readonly options: Options
  public readonly project: string
  public bucket!: s3.IBucket
  public readonly promote: boolean = Container.get('promote')

  constructor (scope: cdk.Construct, options: Options) {
    this.scope = scope
    this.options = options
    this.project = projectName(this.options)
  }

  public get s3SrcFolder () {
    return `${this.project}-${this.options.packageVersion ?? ''}`
  }

  public get s3ProjectMetadata () {
    return `${this.s3SrcFolder}/metadata.zip`
  }

  public getReleasesBucketfromBucketArn () {
    const bucketName = getReleasesBucketName(this.options)
    const s3AssetsArn = s3Arn(bucketName)
    return (this.bucket = s3.Bucket.fromBucketArn(
      this.scope,
      _.camelCase(bucketName),
      s3AssetsArn,
    ))
  }
}

export class InternalStack extends cdk.Stack {
  protected readonly stackTools: StackTools
  protected readonly options: Options

  constructor (
    scope: cdk.Construct,
    options: Options,
    stackId: string,
    description = '',
  ) {
    super(scope, stackId, {
      description,
      env: {
        account: options.awsAccount,
        region: options.awsRegion,
      },
    })
    this.options = options
    this.stackTools = new StackTools(this, options)
  }
}

export class InternalNestedStack extends cdk.NestedStack {
  protected readonly stackTools: StackTools
  protected readonly options: Options

  constructor (scope: cdk.Construct, options: Options, stackId: string) {
    super(scope, stackId)
    this.options = options
    this.stackTools = new StackTools(this, options)
  }
}
