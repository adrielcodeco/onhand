import Axios from 'axios'

const baseURL = `${window.location.origin}/api`
const timeout = 1000 * 15

export abstract class Api {
  protected resource = ''

  protected async get (
    options: Partial<{ id: string, params: any, pathExt: string } & any>,
  ) {
    const { id, params } = options
    let url = `/${this.resource}${id ? '/' : ''}${id ?? ''}${
      options.pathExt ?? ''
    }`
    for (const key in options) {
      const regex = new RegExp(`\\/:${key}\\/`, 'g')
      url = url.replace(regex, `/${options[key]}/`)
    }
    return Axios.get(url, {
      baseURL,
      params,
      timeout,
      validateStatus: (status: number) => true,
    }).then(response => {
      return response.data
    })
  }

  protected async post (options: Partial<{ data: any, pathExt: string } & any>) {
    const { data } = options
    let url = `/${this.resource}${options.pathExt ?? ''}`
    for (const key in options) {
      const regex = new RegExp(`\\/:${key}\\/`, 'g')
      url = url.replace(regex, `/${options[key]}/`)
    }
    return Axios.post(url, data, {
      baseURL,
      timeout,
      validateStatus: (status: number) => true,
    }).then(response => {
      return response.data
    })
  }

  protected async put (options: Partial<{ id: string, data: any } & any>) {
    const { id, data } = options
    let url = `/${this.resource}/${id}`
    for (const key in options) {
      const regex = new RegExp(`\\/:${key}\\/`, 'g')
      url = url.replace(regex, `/${options[key]}/`)
    }
    return Axios.put(url, data, {
      baseURL,
      timeout,
      validateStatus: (status: number) => true,
    }).then(response => {
      return response.data
    })
  }

  protected async delete (options: Partial<{ id: string } & any>) {
    const { id } = options
    let url = `/${this.resource}/${id}`
    for (const key in options) {
      const regex = new RegExp(`\\/:${key}\\/`, 'g')
      url = url.replace(regex, `/${options[key]}/`)
    }
    return Axios.delete(url, {
      baseURL,
      timeout,
      validateStatus: (status: number) => true,
    }).then(response => {
      return response.data
    })
  }
}
