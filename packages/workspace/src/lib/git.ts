import simpleGit, { SimpleGit } from 'simple-git'
import { Octokit } from 'octokit'
import { logIfPermitted } from '#/lib/log'

export const checkAccess = async (
  personalAccessToken: string,
  verbose: boolean,
) => {
  const log = logIfPermitted(verbose)
  try {
    const octokit = new Octokit({ auth: personalAccessToken })
    const {
      data: { login },
    } = await octokit.rest.users.getAuthenticated()
    return login
  } catch (err) {
    log(err)
    return ''
  }
}

export const createRepo = async (
  personalAccessToken: string,
  repoName: string,
  privateRepo: boolean,
  githubLogin: string,
  verbose: boolean,
) => {
  const log = logIfPermitted(verbose)
  try {
    const octokit = new Octokit({ auth: personalAccessToken })
    const response = await octokit.rest.repos.createUsingTemplate({
      template_owner: 'co2lab',
      template_repo: 'onhand-repo-template',
      name: repoName,
      owner: githubLogin,
      private: privateRepo,
    })
    return response.data
  } catch (err) {
    log(err)
    throw 'This repo name is invalid or is already in use, try another.'
  }
}

export const initRepo = async (cwd: string, repoUrl: string) => {
  const git: SimpleGit = simpleGit(cwd)
  return git.init().addRemote('origin', repoUrl)
}

export const pull = async (cwd: string, branch: string) => {
  const git: SimpleGit = simpleGit(cwd)
  return git.pull('origin', branch)
}

export const commitChanges = async (cwd: string, commitMessage: string) => {
  const git: SimpleGit = simpleGit(cwd)
  return git.add('./*').commit(commitMessage)
}

export const pushToRemote = async (cwd: string, branch: string) => {
  const git: SimpleGit = simpleGit(cwd)
  return git.push(['-u', 'origin', `HEAD:${branch}`])
}

export const status = (cwd: string) => {
  const git: SimpleGit = simpleGit(cwd)
  return git.status()
}

export const clone = (cwd: string, gitUrl: string) => {
  const git: SimpleGit = simpleGit(cwd)
  return git.clone(gitUrl)
}

export const switchAndCreateBranchIfNotExists = async (
  cwd: string,
  branch: string,
) => {
  const git: SimpleGit = simpleGit(cwd)
  return git
    .raw(['switch', branch])
    .catch(() => git.raw(['switch', '-c', branch]))
}

export const checkoutBranch = (cwd: string, branch: string) => {
  const git: SimpleGit = simpleGit(cwd)
  return git.checkout(['-t', `origin/${branch}`])
}

export const checkoutTag = (cwd: string, tag: string) => {
  const git: SimpleGit = simpleGit(cwd)
  return git.checkout([`tags/${tag}`, '-b', tag])
}
