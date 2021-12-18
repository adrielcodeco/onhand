import fs from 'fs'
import fsExtra from 'fs-extra'
import path from 'path'
import archiver from 'archiver'
import glob from 'glob'
import rimraf from 'rimraf'
import { Options } from './options'
import { getConfigOrDefault } from './config'
import { Bundles } from './bundles'

export async function pack (options: Options, bundles?: Bundles) {
  const outputFolder = path.resolve(
    options.cwd,
    getConfigOrDefault(options.config, c => c.package?.outputFolder)!,
  )
  console.log(outputFolder)
  rimraf.sync(outputFolder)
  console.log('starting the packaging')
  if (bundles) {
    await packBundles(options, bundles)
  } else {
    await packALl(options)
  }
  console.log('the packaging has been completed ')
}

async function packALl (options: Options) {
  return new Promise((resolve, reject) => {
    let ended = false
    const end = (err?: any) => {
      if (ended) return
      ended = true
      !err ? resolve('') : reject(err)
    }
    const outputFolder = getConfigOrDefault(
      options.config,
      c => c.package?.outputFolder,
    )!
    const packageName = getConfigOrDefault(
      options.config,
      c => c.package?.name,
    )!
    const packageFiles = getConfigOrDefault(
      options.config,
      c => c.package?.files,
    )!
    fsExtra.ensureDirSync(path.resolve(options.cwd, outputFolder))
    const bundleFile = path.resolve(
      options.cwd,
      outputFolder,
      `${packageName}.zip`,
    )
    console.log(`package file: ${bundleFile}`)
    const archive = zipBundle(bundleFile, end)

    for (const pattern of packageFiles) {
      if (typeof pattern === 'string') {
        // append files from a glob pattern
        const files = glob.sync(pattern, { cwd: options.cwd, nodir: true })
        for (const file of files) {
          console.log(`adding ${file}`)
          const stream = fs.createReadStream(path.resolve(options.cwd, file))
          archive.append(stream, {
            name: path.normalize(file),
          })
        }
      } else {
        const { root, pattern: regex } = pattern
        const cwd = path.resolve(options.cwd, root)
        const files = glob.sync(regex, {
          cwd,
          nodir: true,
        })
        for (const file of files) {
          console.log(`adding ${file}`)
          const stream = fs.createReadStream(path.resolve(cwd, file))
          archive.append(stream, { name: path.normalize(file) })
        }
      }
    }

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    archive.finalize().catch(console.error)
  })
}

async function packBundles (options: Options, bundles: Bundles) {
  const outputFolder = getConfigOrDefault(
    options.config,
    c => c.package?.outputFolder,
  )!
  const buildOutputFolder = getConfigOrDefault(
    options.config,
    c => c.build?.outputFolder,
  )!
  fsExtra.ensureDirSync(path.resolve(options.cwd, outputFolder))

  let maxLength = 0
  for (const bundle of bundles) {
    if (maxLength < bundle.entrypoint.length) {
      maxLength = bundle.entrypoint.length
    }
  }

  for (const bundle of bundles) {
    await new Promise((resolve, reject) => {
      let ended = false
      const bundleFile = path.resolve(
        options.cwd,
        outputFolder,
        `${bundle.entrypoint}.zip`,
      )
      const end = (err?: any, bytes?: number) => {
        if (ended) return
        ended = true
        console.log(
          `package file: ${bundle.entrypoint} ${' '.repeat(
            maxLength - bundle.entrypoint.length,
          )} with ${bytes} bytes`,
        )
        !err ? resolve('') : reject(err)
      }
      const archive = zipBundle(bundleFile, end)

      for (const file of bundle.files) {
        let fileName = file
        if (bundle.entrypointFile === file) {
          fileName = 'index.js'
        }
        const stream = fs.createReadStream(
          path.resolve(options.cwd, buildOutputFolder, file),
        )
        archive.append(stream, { name: fileName })
      }

      // finalize the archive (ie we are done appending files but streams have to finish yet)
      // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      archive.finalize().catch(console.error)
    })
  }
}

function zipBundle (
  bundlePath: string,
  end: (err?: any, bytes?: number) => void,
) {
  const bundle = fs.createWriteStream(bundlePath)
  const archive = archiver('zip', {
    zlib: { level: 9 },
  })

  bundle.on('close', function () {
    end(null, archive.pointer())
  })

  // This event is fired when the data source is drained no matter what was the data source.
  // It is not part of this library but rather from the NodeJS Stream API.
  // @see: https://nodejs.org/api/stream.html#stream_event_end
  bundle.on('end', function () {
    console.log('Data has been drained')
  })

  // good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      // log warning
    } else {
      // throw error
      throw err
    }
  })

  // good practice to catch this error explicitly
  archive.on('error', function (err) {
    end(err)
    throw err
  })

  // pipe archive data to the file
  archive.pipe(bundle)

  return archive
}
