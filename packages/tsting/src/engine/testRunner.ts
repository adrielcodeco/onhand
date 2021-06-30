import path from 'path'
import { spawn, ChildProcess } from 'child_process'
import { Config } from '#/engine/onhandFile'

export type Statistics = {
  successes: number
  failures: number
  tags: string[]
}

export async function testRunner (
  testPath: string,
  config: Config,
): Promise<Statistics> {
  return new Promise((resolve, reject) => {
    let ended = false
    const childProcess: ChildProcess = spawn(
      'node',
      [path.resolve(__dirname, '../../bin/tsting-runner'), testPath],
      {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        cwd: process.cwd(),
        env: {
          ...process.env,
          TEST_ENGINE: 'true',
          TEST_SETUP: config.testSetup,
        },
      },
    )
    childProcess.on('error', () => {
      if (ended) {
        return
      }
      // eslint-disable-next-line prefer-promise-reject-errors
      reject('an error has occurred.')
      ended = true
      childProcess.kill('SIGINT')
    })
    childProcess.on('exit', () => {
      if (ended) {
        return
      }
      // eslint-disable-next-line prefer-promise-reject-errors
      reject('an error has occurred.')
      ended = true
    })
    childProcess.on('message', (msg: any) => {
      if (msg.action === 'exit') {
        if (ended) {
          return
        }
        if (msg.err) {
          reject(
            typeof msg.err === 'string'
              ? msg.err
              : JSON.stringify({ err: msg.err }),
          )
        } else {
          resolve(msg.statistics as Statistics)
        }
        ended = true
        childProcess.kill('SIGINT')
      }
    })
  })
}
