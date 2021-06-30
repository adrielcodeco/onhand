import { Request, Response, NextFunction } from 'express'
import { API } from '#/server/iApi'

export const api: API = {
  method: 'get',
  path: '',
  controller: async (req: Request, res: Response, next: NextFunction) => {
    // TODO:
  },
}
