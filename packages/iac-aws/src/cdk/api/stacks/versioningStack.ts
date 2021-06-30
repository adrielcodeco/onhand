/* eslint-disable no-new */
import * as cdk from '@aws-cdk/core'
import { SourceVersioningStack } from '#/cdk/customStacks/sourceVersioningStack'
import { Options, resourceName } from '#/app/options'

export class VersioningStack extends cdk.NestedStack {
  constructor (scope: cdk.Construct, private readonly options: Options) {
    super(scope, resourceName(options, 's3-versioning'))

    this.sourceVersioning()
  }

  private sourceVersioning () {
    const s3UploadStack = new SourceVersioningStack(
      this,
      this.options,
      'source-versioning',
    )
    const key = `${this.options.packageName ?? ''}-${
      this.options.packageVersion ?? ''
    }`
    s3UploadStack.versioning(key)
  }
}
