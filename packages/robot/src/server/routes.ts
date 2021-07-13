import path from 'path'
import glob from 'glob'
import { Router, Request, Response, NextFunction } from 'express'
import { API, instanceOfAPI } from '#/server/iApi'

const resolveFromSrc = (...filePath: string[]) =>
  path.resolve(__dirname, '../', ...filePath)

const files = glob
  .sync('**/*[!.d].[tj]s', { cwd: resolveFromSrc('./server/api') })
  .map(p =>
    path.format({
      ...path.parse(p),
      base: undefined,
      ext: undefined,
    }),
  )

export const routes = Router()

for (const file of files) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const module = require(resolveFromSrc('./server/api', file))

  if (!module || typeof module !== 'object') {
    throw new Error(`api not found for file: ${file}`)
  }
  for (const apiKey in module) {
    if (!instanceOfAPI(module[apiKey])) {
      throw new Error(`api not found for file: ${file}`)
    }

    const api = module[apiKey] as API
    if (!(api.method in routes)) {
      throw new Error(`api method ${api.method} not found for file ${file}`)
    }
    const method = routes[api.method].bind(routes)

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    method(`/api${api.path}`, api.controller)
  }
}

routes.use('/api/*', (req: Request, res: Response, next: NextFunction) => {
  res.status(404)
  res.end()
})

routes.get('*', (req: Request, res: Response, next: NextFunction) => {
  res.sendFile(path.resolve(__dirname, '../../public/index.html'))
})
