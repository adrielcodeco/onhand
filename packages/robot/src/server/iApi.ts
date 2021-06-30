import { Request, Response, NextFunction } from 'express'

export interface API {
  path: string
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  controller: (req: Request, res: Response, next: NextFunction) => Promise<void>
}
