import path from 'path'
import express from 'express'
import cors from 'cors'
import { execute } from 'lambda-local'
import _ from 'lodash'
import {
  APIGatewayEventIdentity,
  APIGatewayProxyEvent,
  APIGatewayRequestAuthorizerEvent,
} from 'aws-lambda'
import winston from 'winston'
import expressWinston from 'express-winston'
import { HttpMethods, toMethod } from '@onhand/openapi'
import { Options } from '#/app/options'
import { getConfigOrDefault } from '#/app/config'

const regionId = 'us-east-1'
const accountId = '1'
const apiId = '1'
const stage = 'dev'

export async function serve (
  options: Options,
  serverOptions?: {
    port: string
    watch: boolean
    setupDB: boolean
    envFile: string
  },
) {
  console.log('starting server')
  const { localServerPort } = options
  const appSrcDir = path.resolve(
    options.cwd,
    getConfigOrDefault(options.config, c => c.app?.src)!,
  )
  const envFilePath = serverOptions?.envFile
    ? path.resolve(options.cwd, serverOptions?.envFile)
    : ''
  const app = express()
  app.use(express.json())
  expressWinston.requestWhitelist.push('body')
  expressWinston.responseWhitelist.push('body')
  app.use(
    expressWinston.logger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json(),
      ),
      colorize: true,
      metaField: undefined,
    }),
  )
  app.use(
    cors({
      origin: (options.config?.apiGateway?.accessControlAllowOrigin ?? [
        '*',
      ])[0],
      methods: options.config?.apiGateway?.accessControlAllowMethods ?? [
        'OPTIONS',
        'GET',
        'PUT',
        'POST',
        'DELETE',
        'PATCH',
        'HEAD',
      ],
      credentials:
        options.config?.apiGateway?.accessControlAllowCredentials === undefined
          ? true
          : options.config?.apiGateway?.accessControlAllowCredentials,
      allowedHeaders: _.uniq(
        _.concat(
          [
            'Content-Type',
            'X-Amz-Date',
            'Authorization',
            'X-Api-Key',
            'X-Amz-Security-Token',
            'X-Amz-User-Agent',
          ],
          options.config?.apiGateway?.accessControlAllowHeaders ?? [],
          _.concat(
            ...(options.metadata?.authorizers?.map(
              m => m.extra.identitySourcesHeaders as string[],
            ) ?? []),
          ),
        ),
      ),
      exposedHeaders: ['set-cookie'],
    }),
  )
  if (options.metadata) {
    for (const handler of options.metadata.handlers) {
      const {
        className,
        handlerName,
        functionFileAbsolutePath,
        functionMetadata: {
          method,
          path: routePath,
          operation: { description, operationId, security },
        },
      } = handler
      if (security?.length) {
        const { functionFileAbsolutePath: authorizerPath, handlerName } =
          options.metadata.authorizers.find(
            a => (a.extra.authorizerName ?? 'default') in security[0],
          )!
        authorizer(
          app,
          toMethod(method),
          routePath,
          authorizerPath,
          handlerName,
          envFilePath,
        )
      }
      const functionName = operationId ?? className
      const fileExt = path.extname(functionFileAbsolutePath)
      const fileName = path.basename(functionFileAbsolutePath, fileExt)
      const fileDir = path.dirname(functionFileAbsolutePath)
      const srcRelativeFilePath = path.relative(appSrcDir, fileDir)
      const handlerPath = `${srcRelativeFilePath}/${fileName}`
      console.log(
        `onHand - loading lambda: ${functionName} [${handlerPath}*${handlerName}]`,
      )
      if (description) {
        console.log(`         ${description ?? ''}`)
      }
      console.log(`         at [${method.toUpperCase()}] ${routePath}`)
      request(
        app,
        toMethod(method),
        routePath,
        functionFileAbsolutePath,
        handlerName,
        envFilePath,
      )
    }
  }
  app.use(
    expressWinston.errorLogger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json(),
      ),
    }),
  )
  console.log('onHand - good, all routes have been loaded')
  const port = localServerPort ?? serverOptions?.port
  const msg = await new Promise(resolve => {
    app.listen(port, () => {
      resolve(`onHand serving on port ${port ?? ''}`)
    })
  })
  console.log(msg)
}

function authorizer (
  app: express.Application,
  method: HttpMethods,
  routePath: string,
  handlerPath: string,
  handlerName: string,
  envFilePath?: string,
) {
  // eslint-disable-next-line no-useless-escape
  const route = routePath.replace(/{([a-z0-1-_\.]*)}/gim, ':$1')
  app[method](
    route,
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      (async () => {
        const event = makeRequestAuthorizerEvent(req, routePath, method)
        const result: any = await execute({
          lambdaPath: handlerPath,
          lambdaHandler: handlerName,
          timeoutMs: 1000 * 60 * 10, // 10 min
          verboseLevel: 3,
          envfile: envFilePath,
          event,
        }).catch(err => err)
        if (result === 'Unauthorized') {
          console.log('onHand - authorizer result:', result)
          res.setHeader('Content-Type', 'application/json')
          res.status(401).end(result)
          return
        }
        console.log('onHand - authorizer result:', result.context)
        Reflect.set(req, 'authorizer', result.context)
        next()
      })().catch(res.json)
    },
  )
}

function request (
  app: express.Application,
  method: HttpMethods,
  routePath: string,
  handlerPath: string,
  handlerName: string,
  envFilePath?: string,
) {
  // eslint-disable-next-line no-useless-escape
  const route = routePath.replace(/{([a-z0-1-_\.]*)}/gim, ':$1')
  app[method](route, (req: express.Request, res: express.Response) => {
    (async () => {
      const event = makeProxyEvent(req, routePath, method)
      const result: any = await execute({
        lambdaPath: handlerPath,
        lambdaHandler: handlerName,
        timeoutMs: 1000 * 60 * 10, // 10 min
        verboseLevel: 3,
        envfile: envFilePath,
        event,
      }).catch(err => err)
      // Respond to HTTP request
      res.setHeader('Content-Type', 'application/json')
      res.status(result.statusCode).set(result.headers).end(result.body)
    })().catch(res.json)
  })
}

function makeRequestAuthorizerEvent (
  req: express.Request,
  routePath: string,
  method: string,
) {
  const {
    headers,
    multiValueHeaders,
    queryStringParameters,
    multiValueQueryStringParameters,
    pathParameters,
    stageVariables,
  } = inputs(req)
  const methodArn = `arn:aws:execute-api:${regionId}:${accountId}:${apiId}/${stage}/${method}/*`
  const event: APIGatewayRequestAuthorizerEvent = {
    type: 'REQUEST',
    methodArn,
    resource: routePath,
    path: routePath,
    httpMethod: method,
    headers,
    multiValueHeaders,
    pathParameters,
    queryStringParameters,
    multiValueQueryStringParameters,
    stageVariables,
    requestContext: requestContext(req),
  }
  return event
}

function makeProxyEvent (
  req: express.Request,
  routePath: string,
  method: string,
) {
  const {
    headers,
    multiValueHeaders,
    queryStringParameters,
    multiValueQueryStringParameters,
    pathParameters,
    stageVariables,
  } = inputs(req)
  const event: APIGatewayProxyEvent = {
    resource: routePath,
    path: routePath,
    httpMethod: method,
    requestContext: requestContext(req),
    headers,
    multiValueHeaders,
    queryStringParameters,
    multiValueQueryStringParameters,
    pathParameters,
    stageVariables,
    body: JSON.stringify(req.body),
    isBase64Encoded: false,
  }
  return event
}

function inputs (req: express.Request) {
  const headers: {
    [name: string]: string
  } =
    (_.fromPairs(_.chunk(req.rawHeaders ?? [], 2)) as {
      [name: string]: string
    }) ?? {}
  const multiValueHeaders: { [name: string]: string[] } = {}
  for (const header in headers) {
    multiValueHeaders[header] = [headers[header]]
  }
  let queryStringParameters: {
    [name: string]: string
  } | null = null
  let multiValueQueryStringParameters: {
    [name: string]: string[]
  } | null = null
  for (const query in req.query) {
    if (Array.isArray(req.query[query])) {
      if (!multiValueQueryStringParameters) {
        multiValueQueryStringParameters = {}
      }
      multiValueQueryStringParameters[query] = req.query[query] as string[]
    } else {
      if (!queryStringParameters) {
        queryStringParameters = {}
      }
      queryStringParameters[query] = req.query[query] as string
    }
  }
  return {
    headers,
    multiValueHeaders,
    queryStringParameters,
    multiValueQueryStringParameters,
    pathParameters: req.params,
    stageVariables: null,
  }
}

function requestContext (req: express.Request) {
  return {
    accountId,
    apiId,
    authorizer: Reflect.get(req, 'authorizer'),
    protocol: '',
    httpMethod: '',
    identity: identity(),
    path: '',
    stage,
    requestId: '',
    requestTimeEpoch: 1,
    resourceId: '',
    resourcePath: '',
  }
}

function identity (): APIGatewayEventIdentity {
  return {
    accessKey: null,
    accountId,
    apiKey: null,
    apiKeyId: null,
    caller: null,
    clientCert: null,
    cognitoAuthenticationProvider: null,
    cognitoAuthenticationType: null,
    cognitoIdentityId: null,
    cognitoIdentityPoolId: null,
    principalOrgId: null,
    sourceIp: '',
    user: null,
    userAgent: null,
    userArn: null,
  }
}
