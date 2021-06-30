import React from 'react'
import fs from 'fs'
import path from 'path'
import ReactDOMServer from 'react-dom/server'
import { Request, Response, NextFunction } from 'express'

export function render(Page: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const app = ReactDOMServer.renderToString(<Page />)
    const templateFile = path.resolve(__dirname, '../../public/_.html')
    const template = fs.readFileSync(templateFile, 'utf8')
    const rootTag = (body: any) => `<div id="root">${body}</div>`
    res.send(template.replace(rootTag(''), rootTag(app)))
  }
}
