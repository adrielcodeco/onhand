import path from 'path'
import { BaseGenerator } from './generator'
import { WorkspaceConfig } from '#/lib/workspaceConfig'

export class WorkspaceGenerator extends BaseGenerator {
  get workspaceConfig (): WorkspaceConfig {
    return this.env.options.workspaceConfig
  }

  paths () {
    super.paths()
    this.destinationRoot(
      path.resolve(this.env.cwd, this.workspaceConfig.workspaceName),
    )
  }

  writing () {
    this.repositoryFolder()
    this.rootFiles()
  }

  repositoryFolder () {
    this.fs.copyTpl(
      this.templatePath('.gitkeep'),
      this.destinationPath(
        `${this.workspaceConfig.repositoriesFolder}/.gitkeep`,
      ),
    )
  }

  rootFiles () {
    this.fs.copyTpl(
      this.templatePath('.editorconfig'),
      this.destinationPath('.editorconfig'),
    )
    this.fs.copyTpl(
      this.templatePath('.eslintignore'),
      this.destinationPath('.eslintignore'),
    )
    this.fs.copyTpl(
      this.templatePath('.eslintrc.js'),
      this.destinationPath('.eslintrc.js'),
    )
    this.fs.copyTpl(
      this.templatePath('.gitignore'),
      this.destinationPath('.gitignore'),
      { repositoriesFolder: this.workspaceConfig.repositoriesFolder },
    )
    this.fs.copyTpl(
      this.templatePath('.prettierignore'),
      this.destinationPath('.prettierignore'),
    )
    this.fs.copyTpl(
      this.templatePath('.prettierrc'),
      this.destinationPath('.prettierrc'),
    )
    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'),
      {
        projectName: this.workspaceConfig.workspaceName,
        author: '',
        homepage: '',
        license: '',
        repoUrl: '',
      },
    )
    this.fs.copyTpl(
      this.templatePath('README.md'),
      this.destinationPath('README.md'),
      { projectName: this.workspaceConfig.workspaceName, projectType: '' },
    )
    this.fs.copyTpl(
      this.templatePath('tsconfig.json'),
      this.destinationPath('tsconfig.json'),
    )
  }
}
