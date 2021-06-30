import path from 'path'
import glob from 'glob'
import { Router } from 'express'
import { API } from '#/server/iApi'

const files = glob
  .sync('**/*.[tj]s', { cwd: path.resolve(__dirname, '../api') })
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
  const module = require(path.resolve(__dirname, '../api', file))
  if (!module?.default || typeof module.default !== 'function') {
    throw new Error(`api not found for file: ${file}`)
  }
  const api = module.default as API
  if (!(api.method in routes)) {
    throw new Error(`api method ${api.method} not found for file ${file}`)
  }
  const method = routes[api.method]

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  method(api.path, api.controller)
}
