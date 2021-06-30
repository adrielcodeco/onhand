import { ACRole } from '#/role'

export class ACGroup {
  name!: string
  roles!: ACRole[]
}

export function isGroup (obj: any): obj is ACGroup {
  return typeof obj === 'object' && !!obj && 'roles' in obj
}
