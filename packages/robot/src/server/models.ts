import path from 'path'
import nconf from 'nconf'

export const models = (userDataPath: string) => {
  const addModel = (model: string) => {
    nconf.add(model, {
      type: 'file',
      file: path.resolve(userDataPath, `onhand/${model}.json`),
    })
  }
  addModel('projects')
}
