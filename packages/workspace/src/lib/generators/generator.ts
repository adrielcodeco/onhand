import path from 'path'
import Generator from 'yeoman-generator'

export class BaseGenerator extends Generator {
  paths () {
    const templatePath = path.resolve(__dirname, '../../../templates')
    this.sourceRoot(templatePath)
  }

  install () {
    this.installDependencies({ bower: false, npm: false, yarn: true })
  }
}
