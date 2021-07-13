import { Request, Response, NextFunction } from 'express'

export interface API {
  path: string
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  controller: (req: Request, res: Response, next: NextFunction) => Promise<void>
}

export function instanceOfAPI (obj: any): obj is API {
  return (
    'path' in obj &&
    typeof obj.path === 'string' &&
    'method' in obj &&
    typeof obj.method === 'string' &&
    'controller' in obj &&
    typeof obj.controller === 'function'
  )
}
