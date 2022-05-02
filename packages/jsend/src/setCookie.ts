import { serialize } from 'cookie'
import { manageHttpMetadata } from './httpMetadata'

export function setCookie<T> (
  target: T,
  cookie: {
    name: string
    value: string
    domain?: string
    expires?: Date
    httpOnly?: boolean
    maxAge?: number
    path?: string
    priority?: 'low' | 'medium' | 'high'
    sameSite?: true | false | 'lax' | 'strict' | 'none'
    secure?: boolean
  },
): T {
  const {
    name,
    value,
    domain,
    expires,
    httpOnly,
    maxAge,
    path,
    priority,
    sameSite,
    secure,
  } = cookie
  const cookieString = serialize(name, value, {
    domain,
    expires,
    httpOnly,
    maxAge,
    path,
    priority,
    sameSite,
    secure,
  })
  return manageHttpMetadata(target)
    .change(metadata => {
      metadata.headers = {
        ...(metadata.headers ?? {}),
        'Set-Cookie': cookieString,
      }
      return metadata
    })
    .end()
}
