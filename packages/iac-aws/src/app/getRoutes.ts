/* eslint-disable @typescript-eslint/no-var-requires */
import 'reflect-metadata'
// import path from 'path'
// import glob from 'glob'
import { Route } from './route'
// import { manageDocumentMetadata, manageHandlerMetadata } from '@onhand/openapi'

// const symbolOnhandHandlerMetadata = Symbol.for('onhand-handler-metadata')

export function getRoutes (openApiPath: string, srcPath: string): Route[] {
  // let functionsDir = ''
  // const openApiModule = require(openApiPath)
  // for (const _exportKey in openApiModule) {
  //   const _export = openApiModule[_exportKey]
  //   const openApiMetadata = manageDocumentMetadata(_export).get()
  //   if (openApiMetadata) {
  //     functionsDir = manageDocumentMetadata(_export).get().handlersDirectoryPath
  //   }
  // }
  // if (!functionsDir) {
  //   throw new Error('functions directory not found')
  // }
  // if (!path.isAbsolute(functionsDir)) {
  //   functionsDir = path.resolve(path.dirname(openApiPath), functionsDir)
  // }
  // const files = glob.sync('**/*.js', { cwd: functionsDir })
  // const routes: Route[] = []
  // for (const file of files) {
  //   const absoluteFilePath = path.resolve(functionsDir, file)
  //   const module = require(absoluteFilePath)
  //   const metadataList: any[] = []
  //   const handlers: any[] = []
  //   for (const _exportKey in module) {
  //     const _export = module[_exportKey]
  //     if (
  //       (typeof _export !== 'object' && typeof _export !== 'function') ||
  //       _export === null ||
  //       _export === undefined
  //     ) {
  //       continue
  //     }
  //     const metadata = manageHandlerMetadata(_export).get()
  //     if (metadata) {
  //       const method = managePathMetadata(_export).getMethod()
  //       metadataList.push({ metadata, method })
  //     }
  //     const handlerMetadata = Reflect.getMetadata(
  //       symbolOnhandHandlerMetadata,
  //       _export,
  //     )
  //     if (handlerMetadata) {
  //       handlers.push({ metadata: handlerMetadata, key: _exportKey })
  //     }
  //   }
  //   for (const { metadata, method } of metadataList) {
  //     for (const routePath in metadata) {
  //       if (!Object.prototype.hasOwnProperty.call(metadata, routePath)) {
  //         continue
  //       }
  //       const methodMetadata = metadata[routePath][method]
  //       const operationId = String(methodMetadata.operationId || '')
  //       const handler = handlers.find(h => h.metadata.class === operationId)
  //       const fileExt = path.extname(absoluteFilePath)
  //       const fileName = path.basename(absoluteFilePath, fileExt)
  //       const fileDir = path.dirname(absoluteFilePath)
  //       const srcRelativeFilePath = path.relative(srcPath, fileDir)
  //       routes.push({
  //         method: method,
  //         path: routePath,
  //         handler: `${srcRelativeFilePath}/${fileName}.${String(handler.key)}`,
  //         description: methodMetadata.description,
  //         operationName: methodMetadata.operationId,
  //       })
  //     }
  //   }
  // }
  // return routes
  return []
}
