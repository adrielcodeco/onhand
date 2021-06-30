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
