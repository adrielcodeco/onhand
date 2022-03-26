export enum HttpMethods {
  get = 'get',
  put = 'put',
  post = 'post',
  delete = 'delete',
  options = 'options',
  head = 'head',
  patch = 'patch',
  trace = 'trace',
}

export function isHttpMethod (method: any): method is HttpMethods {
  return typeof method === 'string' && method in HttpMethods
}

export function toMethod (method: string): HttpMethods {
  if (!isHttpMethod(method)) {
    throw new Error(`Invalid HTTP method: ${method}`)
  }
  return method
}
