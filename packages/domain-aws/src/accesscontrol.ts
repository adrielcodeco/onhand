export interface AccessControl {
  cognitoToken: string
  opaqueToken: string
  scope: string
  userIdentifier: string
  role: string
}
