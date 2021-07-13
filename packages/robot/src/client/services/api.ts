import Axios from 'axios'

const baseURL = 'http://localhost:3000/api'
const timeout = 1000 * 5

export abstract class Api {
  protected resource = ''

  protected async get ({ id, params }: Partial<{ id: string, params: any }>) {
    return Axios.get(`/${this.resource}${id ? '/' : ''}${id ?? ''}`, {
      baseURL,
      params,
      timeout,
      validateStatus: (status: number) => true,
    }).then(response => {
      return response.data
    })
  }

  protected async post (data: any) {
    return Axios.post(`/${this.resource}`, data, {
      baseURL,
      timeout,
      validateStatus: (status: number) => true,
    }).then(response => {
      return response.data
    })
  }

  protected async put (id: string, data: any) {
    return Axios.put(`/${this.resource}/${id}`, data, {
      baseURL,
      timeout,
      validateStatus: (status: number) => true,
    }).then(response => {
      return response.data
    })
  }

  protected async delete (id: string) {
    return Axios.delete(`/${this.resource}/${id}`, {
      baseURL,
      timeout,
      validateStatus: (status: number) => true,
    }).then(response => {
      return response.data
    })
  }
}
