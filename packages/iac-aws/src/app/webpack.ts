import path from 'path'
import webpack from 'webpack'
import rimraf from 'rimraf'
import _ from 'lodash'
import { OpenAPIV3 } from 'openapi-types'
import { isHttpMethod, manageFunctionMetadata } from '@onhand/openapi'
import { as } from '@onhand/utils'
import { Bundles } from './bundles'
import { Options } from './options'
import { getSeedFiles, getConfigPath } from './seed'
import { getConfigOrDefault } from './config'

export async function compile (options: Options): Promise<Bundles> {
  if (options.config?.app?.type === 'api') {
    return compileApi(options)
  } else if (options.config?.app?.type === 'site') {
    return compileSite(options)
  } else {
    return []
  }
}

function loadBundles (stats: any): Bundles {
  const bundles: Bundles = []
  if (stats?.compilation?.chunkGroups) {
    const childrenChunks: any[] = []
    for (const {
      options: { dependOn, name },
    } of stats.compilation.chunkGroups) {
      for (const chunk of dependOn ?? []) {
        if (!childrenChunks.includes(chunk)) {
          childrenChunks.push(chunk)
        }
      }
      stats?.compilation?.chunkGroups
        .filter((groups: any) =>
          String(groups.options.name).startsWith(`${name}-`),
        )
        .forEach((groups: any) => {
          if (!childrenChunks.includes(groups.options.name)) {
            childrenChunks.push(groups.options.name)
          }
        })
    }
    const rootChunkGroups = stats.compilation.chunkGroups.filter(
      (groups: any) => !childrenChunks.includes(groups.options.name),
    )
    for (const { options, chunks } of rootChunkGroups) {
      const entrypoint = options.name
      let entrypointFile = ''
      const files: string[] = []
      const loadFiles = (filesToLoad: any[]) => {
        for (const file of filesToLoad) {
          if (!files.includes(file)) {
            files.push(file)
          }
        }
      }
      const loadChunkFiles = (chunk: any) => {
        loadFiles(chunk.files)
        loadFiles(chunk.auxiliaryFiles)
      }
      for (const chunk of chunks) {
        const { id, files: chunkFiles } = chunk as {
          id: string
          files: Set<string>
          auxiliaryFiles: Set<string>
        }
        if (id === options.name) {
          entrypointFile = Array.from(chunkFiles)[0]
        }
        loadChunkFiles(chunk)
      }
      for (const dependOn of options.dependOn ?? []) {
        const group = stats.compilation.chunkGroups.find(
          (group: any) => group.options.name === dependOn,
        )
        for (const chunk of group.chunks) {
          loadChunkFiles(chunk)
        }
      }
      const relatedChunks = stats?.compilation?.chunkGroups.filter(
        (groups: any) =>
          String(groups.options.name).startsWith(`${entrypoint}-`),
      )
      for (const { chunks } of relatedChunks) {
        for (const chunk of chunks) {
          loadChunkFiles(chunk)
        }
      }
      bundles.push({
        entrypoint,
        entrypointFile,
        files,
      })
    }
  }
  return bundles
}

async function compileApi (options: Options): Promise<Bundles> {
  const isProd = options.stage === 'prd'
  const root = options.cwd
  const resolve = (uri: string) => path.resolve(root, uri)
  const output = resolve(
    getConfigOrDefault(options.config, c => c?.build?.outputFolder)!,
  )
  const tsconfig = await import(resolve('tsconfig.json'))

  rimraf.sync(output)

  const config: webpack.Configuration = {}

  config.context = root
  config.watch = false
  config.cache = false
  config.target = 'node'
  config.mode = isProd ? 'production' : 'development'

  if (!isProd) {
    config.devtool = 'source-map'
  }

  config.entry = {}

  const configPath = getConfigPath(options)
  const seedFiles = getSeedFiles(options)
  if (seedFiles && configPath) {
    config.entry['onhand-seed-function'] = path.resolve(
      __dirname,
      '../cdk/api/functions/seed.js',
    )
    for (const file of seedFiles) {
      const fileName = `onhand-seed-function-${path.basename(
        file,
        path.extname(file),
      )}`
      config.entry[fileName] = {
        import: file,
        filename: `${fileName}.js`,
      }
    }
  }

  config.entry['onhand-roles-function'] = path.resolve(
    __dirname,
    '../cdk/api/functions/roles.js',
  )
  config.entry['onhand-functions-function'] = path.resolve(
    __dirname,
    '../cdk/api/functions/functions.js',
  )
  config.entry['onhand-aliases-function'] = path.resolve(
    __dirname,
    '../cdk/api/functions/aliases.js',
  )

  const openapi = options.openApi!

  for (const secKey in openapi.components?.securitySchemes ?? {}) {
    if (
      !Object.prototype.hasOwnProperty.call(
        openapi.components?.securitySchemes!,
        secKey,
      )
    ) {
      continue
    }
    const sec = openapi.components?.securitySchemes![secKey]
    const {
      functionFileAbsolutePath: absoluteFilePath,
      className: functionName,
    } = manageFunctionMetadata(sec).get()
    config.entry[functionName] = absoluteFilePath
  }

  for (const routePath in openapi.paths) {
    if (!Object.prototype.hasOwnProperty.call(openapi.paths, routePath)) {
      continue
    }
    const pathItemObject: OpenAPIV3.PathItemObject = openapi.paths[routePath]!
    for (const method in pathItemObject) {
      if (!Object.prototype.hasOwnProperty.call(pathItemObject, method)) {
        continue
      }
      if (!isHttpMethod(method)) {
        continue
      }
      const operation: OpenAPIV3.OperationObject = as(pathItemObject)[method]
      const { operationId } = operation
      const {
        functionFileAbsolutePath: absoluteFilePath,
        className,
      } = manageFunctionMetadata(operation).get()
      const functionName = operationId ?? className
      config.entry[functionName] = absoluteFilePath
    }
  }

  const appName = getConfigOrDefault(options.config, c => c.app?.name)!

  config.output = {
    path: output,
    filename: `${appName ?? 'func'}.[name].js`,
    publicPath: '/',
    library: appName,
    libraryTarget: 'umd',
    chunkFilename: '[name].bundle.js',
  }

  config.plugins = [
    // new CleanWebpackPlugin(),
    // new DuplicatePackageCheckerPlugin(),
    // new Visualizer({
    //   filename: './statistics.html',
    // }),
  ]

  config.resolve = {
    modules: [resolve('./node_modules')],
    extensions: ['.ts', '.js', '.json'],
  }

  config.resolve.alias = {}
  if (configPath) {
    Object.assign(config.resolve.alias, {
      'seeds/config': configPath,
    })
  }
  if (tsconfig?.compilerOptions?.paths) {
    for (const _path in tsconfig?.compilerOptions?.paths) {
      const alias = _path.replace('/*', '')
      Object.assign(config.resolve.alias, {
        [alias]: resolve(
          tsconfig?.compilerOptions?.paths[_path][0].replace('/*', ''),
        ),
      })
    }
  }

  config.resolveLoader = {
    modules: [resolve('./node_modules')],
  }

  config.module = {
    parser: {
      javascript: {
        commonjsMagicComments: true,
      },
    },
    rules: [
      {
        test: /\.[tj]s$/i,
        include: [resolve('src')],
        exclude: [/node_modules/],
        use: 'ts-loader',
      },
    ],
  }

  config.optimization = {
    minimize: isProd,
    providedExports: true,
    usedExports: true,
    sideEffects: true,
    splitChunks: { chunks: 'all' },
  }

  const mergedConfig = _.mergeWith(
    config,
    options.config?.build?.webpack ?? {},
    (objValue, srcValue) => {
      if (_.isArray(objValue)) {
        return objValue.concat(srcValue)
      }
      return undefined
    },
  )
  const compiler = webpack(mergedConfig)

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        console.error(err)
        reject(err)
      } else if (stats) {
        const info = stats.toJson()
        if (stats.hasErrors()) {
          console.error(info.errors)
          reject(info.errors)
          return
        }
        console.log(
          stats.toString({
            colors: true,
            hash: false,
            version: true,
            timings: true,
            assets: true,
            chunks: false,
            chunkGroups: false,
            chunkModules: false,
            chunkOrigins: false,
            children: false,
            source: true,
            errors: true,
            errorDetails: true,
            warnings: false,
            publicPath: false,
            modules: true,
            moduleTrace: false,
            reasons: false,
            usedExports: true,
          }),
        )
      }
      resolve(loadBundles(stats))
    })
  })
}

async function compileSite (options: Options): Promise<Bundles> {
  if (!options.config?.build?.webpack) {
    return []
  }
  const webpackConfigPath = path.resolve(
    options.cwd,
    options.config.build.webpack,
  )
  const webpackConfig = await import(webpackConfigPath)
  const config =
    path.extname(webpackConfigPath) === '.js'
      ? webpackConfig.default(
        {},
        { mode: options.stage === 'prd' ? 'production' : 'development' },
      )
      : webpackConfig
  if (options.config.build.outputFolder) {
    config.output.path = path.resolve(
      options.cwd,
      options.config.build.outputFolder,
    )
  }
  delete config.devServer
  if (config.plugins?.length) {
    config.plugins = config.plugins.filter(
      (p: any) => p.constructor.name !== 'HotModuleReplacementPlugin',
    )
  }
  const compiler = webpack(config)
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        console.error(err)
        reject(err)
      } else if (stats) {
        const info = stats.toJson()
        if (stats.hasErrors()) {
          console.error(info.errors)
          reject(info.errors)
          return
        }
        console.log(
          stats.toString({
            colors: true,
            hash: false,
            version: true,
            timings: true,
            assets: true,
            chunks: false,
            chunkGroups: false,
            chunkModules: false,
            chunkOrigins: false,
            children: false,
            source: true,
            errors: true,
            errorDetails: true,
            warnings: false,
            publicPath: false,
            modules: true,
            moduleTrace: false,
            reasons: false,
            usedExports: true,
          }),
        )
      }
      resolve(loadBundles(stats))
    })
  })
}
