import { ACRule } from '@onhand/accesscontrol'

export enum HttpMethods {
  'GET',
  'POST',
  'PUT',
  'DELETE',
}

export abstract class AFunction {
  authenticated?: boolean
  permissions?: ACRule[]
}
