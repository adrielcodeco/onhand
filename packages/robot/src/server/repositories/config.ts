import nconf from 'nconf'
import { promisify } from 'util'

const nconfSave = promisify(nconf.save).bind(nconf)

export const configRepo = {
  cwd: {
    getLast: () => nconf.get('cwd:last'),
    setLast: async (cwd: string) => {
      nconf.set('cwd:last', cwd)
      await nconfSave()
    },
  },
}
