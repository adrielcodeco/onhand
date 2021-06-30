/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path'
import glob from 'glob'
import { OpenAPIV3 } from 'openapi-types'
import { merge } from 'lodash'
import { HttpMethods } from './httpMethods'
import { manageDocumentMetadata } from './documentMetadata'
import { managePathMetadata } from './pathMetadata'
import { manageFunctionMetadata } from './functionMetadata'

const symbolOnhandHandlerMetadata = Symbol.for('onhand-handler-metadata')
const symbolOnhandAuthorizerMetadata = Symbol.for('onhand-authorizer-metadata')

export function extractOpenAPISpecification (
  openApiFilePath: string,
): OpenAPIV3.Document {
  return using({ openApiFilePath })
    .findSpec()
    .findFunctions()
    .forEachFunction()
    .findAuthorizers()
    .findOperation()
    .findHandlerMetadata()
    .setOperationMetadata()
    .findInputMetadata()
    .findOutputMetadata()
    .endFor()
    .preparePaths()
    .returnSpec()
}

function using (context: any) {
  const flow = {
    findSpec: () => contextualize(findSpec),
    findFunctions: () => contextualize(findFunctions),
    forEachFunction: () => forEachFunction(context, flow),
    preparePaths: () => contextualize(preparePaths),
    returnSpec: () => returnSpec(context),
  }
  function contextualize (func: any, ...args: any[]) {
    func(context, ...args)
    return flow
  }
  return flow
}

function findSpec (context: any) {
  const { openApiFilePath }: { openApiFilePath: string } = context
  let spec: OpenAPIV3.Document | undefined
  let functionsDir = ''
  const openApiModule = require(openApiFilePath)
  for (const _exportKey in openApiModule) {
    const _export = openApiModule[_exportKey]
    spec = manageDocumentMetadata(_export).get()
    if (spec) {
      functionsDir = manageDocumentMetadata(_export).getPathsDir()
      break
    }
  }
  if (!spec) {
    throw new Error('openApi class not found')
  }
  if (!functionsDir) {
    throw new Error('functions directory not found')
  }

  spec.components = {
    securitySchemes: {},
  }
  Object.assign(context, { spec, functionsDir })
}

function findFunctions (context: any) {
  const {
    openApiFilePath,
    functionsDir,
  }: { openApiFilePath: string, functionsDir: string } = context
  const openApiFileDir = path.dirname(openApiFilePath)
  const absoluteFunctionsDir = path.resolve(openApiFileDir, functionsDir)
  const files = glob.sync('**/*.[tj]s', { cwd: absoluteFunctionsDir })
  Object.assign(context, { files, absoluteFunctionsDir })
}

function forEachFunction<F> (context: any, flow: F) {
  const {
    absoluteFunctionsDir,
    files,
  }: { absoluteFunctionsDir: string, files: string[] } = context
  Object.assign(context, { routes: [] })
  const actions: any[] = []
  const forEachFlow = {
    findAuthorizers: () => contextualize(findAuthorizers),
    findOperation: () => contextualize(findOperation),
    findHandlerMetadata: () => contextualize(findHandlerMetadata),
    setOperationMetadata: () => contextualize(setOperationMetadata),
    findInputMetadata: () => contextualize(findInputMetadata),
    findOutputMetadata: () => contextualize(findOutputMetadata),
    endFor: () => {
      for (const file of files) {
        const loopContext = {}
        const absoluteFilePath = path.resolve(absoluteFunctionsDir, file)
        const module = require(absoluteFilePath)
        for (const _exportKey in module) {
          const _export = module[_exportKey]
          if (
            (typeof _export !== 'object' && typeof _export !== 'function') ||
            _export === null ||
            _export === undefined
          ) {
            continue
          }
          Object.assign(loopContext, { module: _export, absoluteFilePath })
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
  const { spec }: { spec: OpenAPIV3.Document } = context
  const {
    absoluteFilePath,
    operation,
    handlerMetadata,
    module,
  }: {
    absoluteFilePath: string
    operation: any
    handlerMetadata: any
    module: any
  } = loopContext

  if (!operation && !handlerMetadata) {
    const authorizerMetadata = Reflect.getMetadata(
      symbolOnhandAuthorizerMetadata,
      module,
    )
    if (authorizerMetadata) {
      let openapiAuthorizerMetadata = manageFunctionMetadata(
        authorizerMetadata.openapi,
      ).get()
      if (!openapiAuthorizerMetadata) {
        openapiAuthorizerMetadata = merge(
          {
            functionFileAbsolutePath: absoluteFilePath,
            handlerName: module.name,
          },
          { ...authorizerMetadata, openapi: undefined },
        )
        manageFunctionMetadata(authorizerMetadata.openapi).merge(
          openapiAuthorizerMetadata,
        )
      }
      Reflect.set(
        spec.components!.securitySchemes!,
        authorizerMetadata.className,
        authorizerMetadata.openapi,
      )
    }
  }
}

function findOperation (context: any, loopContext: any) {
  const {
    spec,
    routes,
  }: {
    spec: OpenAPIV3.Document
    routes: OpenAPIV3.PathsObject[]
  } = context
  const {
    operation,
    module,
  }: {
    operation: any
    module: any
  } = loopContext

  if (!operation) {
    const metadata = managePathMetadata(module).get()
    if (metadata) {
      const $path = managePathMetadata(module).getPath()
      const method = managePathMetadata(module).getMethod()
      const authorized = managePathMetadata(module).getAuthorized()

      let security: any | undefined
      if (authorized) {
        security = {}
        for (const sec in spec.components!.securitySchemes!) {
          security[sec] = authorized.permissions
            ? authorized.permissions.map(permission => {
              let [
                action,
                possession,
                resource,
                attributes,
              ] = permission.split(':')
              if (!action) {
                switch (method) {
                  case HttpMethods[HttpMethods.post]:
                    action = 'create'
                    break
                  case HttpMethods[HttpMethods.get]:
                    action = 'read'
                    break
                  case HttpMethods[HttpMethods.put]:
                    action = 'update'
                    break
                  case HttpMethods[HttpMethods.delete]:
                    action = 'delete'
                    break
                }
              }
              return [action, possession, resource, attributes]
                .filter(p => !!p)
                .join(':')
            })
            : undefined
        }
      }

      const route = merge({}, metadata)
      const pathItem = route[$path] as {
        [method: string]: OpenAPIV3.OperationObject
      }
      const operation = pathItem[method]
      Object.assign(operation, { security })
      Object.assign(loopContext, { operation })
      routes.push(route)
    }
  }
}

function findHandlerMetadata (context: any, loopContext: any) {
  let {
    handlerMetadata,
    module,
  }: {
    handlerMetadata: any
    module: any
  } = loopContext

  if (!handlerMetadata && module.isHandler) {
    handlerMetadata = Reflect.getMetadata(symbolOnhandHandlerMetadata, module)
    Object.assign(loopContext, { handlerMetadata })
  }
}

function setOperationMetadata (context: any, loopContext: any) {
  const {
    absoluteFilePath,
    handlerMetadata,
    operation,
    module,
  }: {
    absoluteFilePath: string
    handlerMetadata: any
    operation: any
    module: any
  } = loopContext

  if (operation) {
    if (handlerMetadata) {
      manageFunctionMetadata(operation).merge(handlerMetadata)
    }
    if (module.isFunction) {
      const functionMetadata = manageFunctionMetadata(module).get()
      manageFunctionMetadata(operation).merge(functionMetadata ?? {})
    }
    if (module.isHandler) {
      manageFunctionMetadata(operation).merge({
        functionFileAbsolutePath: absoluteFilePath,
        handlerName: module.name,
      })
    }
  }
}

function findInputMetadata (context: any, loopContext: any) {
  // TODO: find input
}

function findOutputMetadata (context: any, loopContext: any) {
  // TODO: find output
}

function preparePaths (context: any) {
  const {
    spec,
    routes,
  }: {
    spec: OpenAPIV3.Document
    routes: OpenAPIV3.PathsObject[]
  } = context
  spec.paths = {}
  for (const route of routes) {
    for (const pathKey in route) {
      if (pathKey in spec.paths && spec.paths[pathKey]) {
        const pathItem = route[pathKey]
        for (const method in pathItem) {
          Reflect.set(
            spec.paths[pathKey]!,
            method,
            Reflect.get(pathItem, method),
          )
        }
      } else {
        spec.paths[pathKey] = route[pathKey]
      }
    }
  }
}

function returnSpec (context: any) {
  const { spec }: { spec: OpenAPIV3.Document } = context
  return spec
}
