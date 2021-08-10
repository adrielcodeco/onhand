import { Express, Request, Response, NextFunction } from 'express'
import { loadCwd } from '#/server/loadCwd'

const cwd = async (expressApp: Express) => {
  const cwdData = await loadCwd()
  expressApp.use((req: Request, res: Response, next: NextFunction) => {
    const request: any = req
    request.context = { cwdData }
    if (req.path.startsWith('/api/')) {
      next()
      return
    }
    res.set('Cache-control', 'no-cache, no-store, must-revalidate')
    next()
  })
}

export const middlewares = async (expressApp: Express) => {
  await cwd(expressApp)
}
