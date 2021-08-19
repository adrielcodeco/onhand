import { transform } from 'lodash'
import { Options } from './options'

export function getOpenAPI (options: Options): string {
  return JSON.stringify(notUndefinedDeep(options.openApi), null, 1)
}

function notUndefinedDeep (obj: any) {
  const processArray = (array: any[]): any[] => {
    const result = []
    for (const item of array) {
      result.push(notUndefinedDeep(item))
    }
    return result
  }
  const processObj = (item: any) => {
    return transform(
      item,
      (result: any, value: any, key: any) => {
        if (value === undefined) {
          return
        }
        if (typeof value === 'object' && value) {
          if (Array.isArray(value)) {
            result[key] = processArray(value)
          } else {
            result[key] = notUndefinedDeep(value)
          }
          return
        }
        result[key] = value
      },
      {},
    )
  }
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return processArray(obj)
    } else {
      return processObj(obj)
    }
  } else {
    return obj
  }
}
