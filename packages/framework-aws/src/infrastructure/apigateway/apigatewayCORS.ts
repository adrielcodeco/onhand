export function CORS (
  incomingHeaders: { [name: string]: string | undefined },
  headers: { [name: string]: string | undefined },
) {
  const result: any = {}
  const credentials = true

  if (credentials) {
    result['Access-Control-Allow-Credentials'] = String(credentials)
  }

  if (!('Access-Control-Allow-Origin' in headers)) {
    const incomingOrigin = incomingHeaders?.origin ?? incomingHeaders?.Origin
    result['Access-Control-Allow-Origin'] =
      credentials && incomingOrigin ? incomingOrigin : '*'
  }

  Object.assign(headers, result)
}
