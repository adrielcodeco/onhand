import { ACRule } from '#/rule'

export class ACRole {
  name!: string
  rules!: ACRule[]
}

export function isRole (obj: any): obj is ACRole {
  return typeof obj === 'object' && !!obj && 'rules' in obj
}
