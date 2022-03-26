/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path'
import glob from 'glob'
import { OpenAPIV3 } from 'openapi-types'
import {
  manageDocumentMetadata,
  DocumentMetadata,
  manageHandlerMetadata,
  HandlerMetadata,
} from './metadata'

export type OnHandMetadata = {
  document: DocumentMetadata
  authorizers: HandlerMetadata[]
  handlers: HandlerMetadata[]
  toOpenApi: () => OpenAPIV3.Document
}

export function extractOnhandMetadata (openApiFilePath: string): OnHandMetadata {
  return using({ openApiFilePath })
    .findSpec()
    .findFunctions()
    .forEachFunction()
    .findAuthorizers()
    .findOperation()
    .findInputMetadata()
    .findOutputMetadata()
    .endFor()
    .result()
}

function using (context: any) {
  const flow = {
    findSpec: () => contextualize(findSpec),
    findFunctions: () => contextualize(findFunctions),
    forEachFunction: () => forEachFunction(context, flow),
    result: () => result(context),
  }
  function contextualize (func: any, ...args: any[]) {
    func(context, ...args)
    return flow
  }
  return flow
}

function findSpec (context: any) {
  const { openApiFilePath }: { openApiFilePath: string } = context
  let documentMetadata: DocumentMetadata | undefined
  const openApiModule = require(openApiFilePath)
  for (const _exportKey in openApiModule) {
    const _export = openApiModule[_exportKey]
    documentMetadata = manageDocumentMetadata(_export).get()
    if (documentMetadata) {
      break
    }
  }
  if (!documentMetadata) {
    throw new Error('openApi class not found')
  }
  if (!documentMetadata.handlersDirectoryPath) {
    throw new Error('handler directory not found')
  }

  Object.assign(context, { documentMetadata })
}

function findFunctions (context: any) {
  const {
    openApiFilePath,
    documentMetadata,
  }: { openApiFilePath: string, documentMetadata: DocumentMetadata } = context
  const openApiFileDir = path.dirname(openApiFilePath)
  const absoluteHandlersDir = path.resolve(
    openApiFileDir,
    documentMetadata.handlersDirectoryPath,
  )
  const handlersFiles = glob.sync('**/*.[tj]s', { cwd: absoluteHandlersDir })
  Object.assign(context, { handlersFiles, absoluteHandlersDir })
}

function forEachFunction<F> (context: any, flow: F) {
  const {
    absoluteHandlersDir,
    handlersFiles,
  }: { absoluteHandlersDir: string, handlersFiles: string[] } = context
  const actions: any[] = []
  const forEachFlow = {
    findAuthorizers: () => contextualize(findAuthorizers),
    findOperation: () => contextualize(findOperation),
    findInputMetadata: () => contextualize(findInputMetadata),
    findOutputMetadata: () => contextualize(findOutputMetadata),
    endFor: () => {
      for (const file of handlersFiles) {
        const loopContext = {}
        const absoluteFilePath = path.resolve(absoluteHandlersDir, file)
        const module = require(absoluteFilePath)
        for (const _exportKey in module) {
          const _export = module[_exportKey]
          if (
            (typeof _export !== 'object' && typeof _export !== 'function') ||
            _export === null ||
            _export === undefined ||
            !_export.isHandler
          ) {
            continue
          }
          Object.assign(loopContext, {
            module: _export,
            moduleName: _exportKey,
            absoluteFilePath,
          })
          for (const action of actions) {
            action(context, loopContext)
          }
        }
      }
      return flow
    },
  }
  function contextualize (func: any) {
    actions.push(func)
    return forEachFlow
  }
  return forEachFlow
}

function findAuthorizers (context: any, loopContext: any) {
  let { authorizers }: { authorizers: HandlerMetadata[] } = context
  const {
    absoluteFilePath,
    handlerMetadata,
    module,
    moduleName,
  }: {
    absoluteFilePath: string
    handlerMetadata: any
    module: any
    moduleName: string
  } = loopContext

  if (handlerMetadata || !module.isAuthorizer) {
    return
  }

  const authorizerMetadata = manageHandlerMetadata(module)
    .changeKey('functionFileAbsolutePath', absoluteFilePath)
    .changeKey('handlerName', moduleName)
    .get()

  if (!authorizerMetadata) {
    return
  }

  if (!authorizers) {
    authorizers = []
  }

  authorizers.push(authorizerMetadata)

  Object.assign(loopContext, { handlerMetadata: authorizerMetadata })
  Object.assign(context, { authorizers })
}

function findOperation (context: any, loopContext: any) {
  let { handlers }: { handlers: HandlerMetadata[] } = context
  const {
    module,
    moduleName,
    absoluteFilePath,
  }: { module: any, moduleName: string, absoluteFilePath: string } = loopContext
  let { handlerMetadata }: { handlerMetadata: HandlerMetadata } = loopContext

  if (handlerMetadata || module.isAuthorizer) {
    return
  }

  handlerMetadata = manageHandlerMetadata(module)
    .changeKey('functionFileAbsolutePath', absoluteFilePath)
    .changeKey('handlerName', moduleName)
    .get()

  if (!handlers) {
    handlers = []
  }

  handlers.push(handlerMetadata)

  Object.assign(loopContext, { handlerMetadata })
  Object.assign(context, { handlers })
}

function findInputMetadata (context: any, loopContext: any) {
  // TODO: find input
}

function findOutputMetadata (context: any, loopContext: any) {
  // TODO: find output
}

function toOpenApi (context: any) {
  return (): OpenAPIV3.Document => {
    const {
      documentMetadata,
      authorizers,
      handlers,
    }: {
      documentMetadata: DocumentMetadata
      authorizers: HandlerMetadata[]
      handlers: HandlerMetadata[]
    } = context
    const spec: Partial<OpenAPIV3.Document> = {
      security: authorizers.map(authorizerMetadata => ({
        [authorizerMetadata.extra.authorizerName ?? 'default']: [],
      })),
      components: {
        securitySchemes: {},
      },
      paths: handlers.reduce(
        (accumulator: OpenAPIV3.PathsObject, currentValue: HandlerMetadata) => {
          const metadata = currentValue.functionMetadata
          Object.assign(accumulator, {
            [metadata.path]: {
              [metadata.method]: metadata.operation,
            },
          })
          return accumulator
        },
        {},
      ),
    }
    Object.assign(spec, documentMetadata.openApi)
    return spec as OpenAPIV3.Document
  }
}

function result (context: any): OnHandMetadata {
  const {
    documentMetadata,
    authorizers,
    handlers,
  }: {
    documentMetadata: DocumentMetadata
    authorizers: HandlerMetadata[]
    handlers: HandlerMetadata[]
  } = context
  return {
    document: documentMetadata,
    authorizers,
    handlers,
    toOpenApi: toOpenApi(context),
  }
}
