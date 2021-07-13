import path from 'path'
import { BaseGenerator } from './generator'
import { Project } from '#/server/dao/project'

export default class ProjectGenerator extends BaseGenerator {
  get project (): Project {
    return (this.env as any).project
  }

  paths () {
    super.paths()
    this.destinationRoot(path.resolve(this.env.cwd, this.project.name))
  }

  writing () {
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('public/index.html'),
      { title: 'Templating with Yeoman' },
    )
  }
}
