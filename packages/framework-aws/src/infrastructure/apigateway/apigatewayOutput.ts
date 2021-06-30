import short from 'short-uuid'
import { APIGatewayProxyResult } from 'aws-lambda'
import { manageHttpMetadata } from '@onhand/jsend/#/httpMetadata'
import { Response, InternalServerError } from '@onhand/jsend'
import { container } from '@onhand/business/#/ioc/container'
import { ILogger, LogToken } from '@onhand/business/#/modules/logger'

export function Output (
  out: Response<any>,
  headers: { [name: string]: string } = {},
): APIGatewayProxyResult {
  if (out instanceof Error) {
    const id = short.generate()
    logError(id, out)
    out = InternalServerError(id)
  }
  const metadata = manageHttpMetadata(out).get()
  if (!metadata) {
    throw new Error(
      'Invalid metadata, Output need to be make with a jsend Responses',
    )
  }
  if (out?.data instanceof Error) {
    const id = short.generate()
    logError(id, out.data)
    out.data = id
  }
  return {
    statusCode: metadata?.statusCode ?? '500',
    headers,
    multiValueHeaders: undefined,
    body: JSON.stringify(out),
    isBase64Encoded: false,
  }
}

function logError (id: string, log: any) {
  if (container.isBound(LogToken)) {
    const logger = container.get<ILogger>(LogToken)
    logger.error(`errorId: ${id}, message:`, log)
  } else {
    console.error(id, log)
  }
}
