import { Request, Response, NextFunction } from 'express'
import { API } from '#/server/iApi'

export const api: API = {
  method: 'get',
  path: '/config',
  controller: async (req: Request, res: Response, next: NextFunction) => {
    const {
      context: {
        cwdData: { cwd, isOnhandProject },
      },
    } = req as any
    res.json({
      cwd,
      initialPage: isOnhandProject ? '/projects/cwd' : '/projects',
    })
  },
}
