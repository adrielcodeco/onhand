import path from 'path'
import glob from 'glob'
import helmet from 'helmet'
import express, { Request, Response, NextFunction } from 'express'
import { routes } from '#/server/routes'

const defaultPort = Number(process.env.PORT ?? 3000)

export const app = async (
  initialPage: 'get-started' | 'manager',
  port = defaultPort,
) => {
  const expressApp = express()
  expressApp.use(helmet())
  expressApp.use(express.static('public'))
  expressApp.use(express.json())
  expressApp.use(express.urlencoded({ extended: true }))
  expressApp.get('/', (_, res: Response) => {
    res.redirect(`/${initialPage}`)
  })
  const pages = glob
    .sync('**/*.[tj]s?(x)', { cwd: path.resolve(__dirname, '../client/pages') })
    .map(p =>
      path.format({
        ...path.parse(p),
        base: undefined,
        ext: undefined,
      }),
    )
  expressApp.get('*', (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.path.replace(/^\//, '')
      if (!pages.includes(file)) {
        throw new Error('page not found!')
      }
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { default: page } = require(path.resolve(
        __dirname,
        '../client/pages',
        file,
      ))
      if (!page || typeof page !== 'function') {
        throw new Error('page not found!')
      }
      page(req, res, next)
    } catch (err) {
      next(err)
    }
  })
  expressApp.use(routes)
  await new Promise((resolve, reject) => {
    try {
      expressApp.listen(port, () => {
        resolve(true)
      })
    } catch (err) {
      reject(err)
    }
  })
  console.log('serving on port 3000')
}
