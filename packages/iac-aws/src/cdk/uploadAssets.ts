import fs from 'fs'
import path from 'path'
import sdk from 'aws-sdk'
import glob from 'glob'
import { Options } from '#/app/options'
import { getConfigOrDefault } from '#/app/config'
import { projectName, getReleasesBucketName } from '#/cdk/resources'
import cliProgress from 'cli-progress'

export async function uploadAssets (
  options: Options,
  credentials: sdk.Credentials,
) {
  console.log('uploading assets...')
  const progressBar = new cliProgress.SingleBar(
    {
      format: '[{bar}] {percentage}% | {value}/{total}',
      hideCursor: true,
    },
    cliProgress.Presets.rect,
  )
  const s3 = new sdk.S3({ credentials })
  const output = getConfigOrDefault(
    options.config,
    c => c?.package?.outputFolder,
  )
  const outputFolder = path.resolve(options.cwd, output!)
  const bundles = glob.sync('*', { cwd: outputFolder, nodir: true })
  progressBar.start(bundles.length, 0)
  for (const bundle of bundles) {
    const Body = fs.createReadStream(path.resolve(outputFolder, bundle))
    await s3
      .upload({
        Bucket: getReleasesBucketName(options),
        Key: `${projectName(options)}-${
          options.packageVersion ?? ''
        }/${bundle}`,
        Body,
      })
      .promise()
    progressBar.increment()
  }
  progressBar.stop()
}
