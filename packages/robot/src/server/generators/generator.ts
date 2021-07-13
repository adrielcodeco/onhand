import path from 'path'
import Generator from 'yeoman-generator'

export class BaseGenerator extends Generator {
  paths () {
    const templatePath = path.resolve(__dirname, './templates')
    this.sourceRoot(templatePath)
  }
}
