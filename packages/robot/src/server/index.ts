import path from 'path'
import helmet from 'helmet'
import morgan from 'morgan'
import session from 'express-session'
import memorystore from 'memorystore'
import express from 'express'
import { routes } from '#/server/routes'
import { middlewares } from '#/server/middlewares'

const defaultPort = Number(process.env.PORT ?? 4100)

const resolveFromSrc = (...filePath: string[]) =>
  path.resolve(__dirname, '../', ...filePath)

export const app = async (
  options: { port: number, verbose: boolean } = {
    port: defaultPort,
    verbose: false,
  },
) => {
  const expressApp = express()
  expressApp.use(helmet())
  expressApp.use(express.static(resolveFromSrc('../public')))
  expressApp.use(express.static(resolveFromSrc('client')))
  expressApp.use(express.json())
  expressApp.set('etag', false)
  expressApp.use(express.urlencoded({ extended: true }))
  if (options.verbose) {
    expressApp.use(morgan('tiny'))
  }
  const MemoryStore = memorystore(session)
  expressApp.use(
    session({
      secret: 'onhand-robot',
      resave: false,
      saveUninitialized: true,
      store: new MemoryStore({
        checkPeriod: 86400000,
      }),
    }),
  )
  await middlewares(expressApp)
  expressApp.use(routes)
  await new Promise((resolve, reject) => {
    try {
      expressApp.listen(options.port, () => {
        resolve(true)
      })
    } catch (err) {
      reject(err)
    }
  })
  console.log(`serving on port ${options.port}`)
}
