import {
  EffectType,
  ActionType,
  ACEffect,
  PossessionType,
  ACPossession,
} from '#/enums'

export class ACRule {
  constructor (
    public action: ActionType,
    public resource: string,
    public possession: PossessionType = ACPossession.own,
    public effect: EffectType = ACEffect.allow,
    public attributes: string[] = ['*'],
  ) {}
}

export function rule (rule: {
  action: ActionType
  resource: string
  possession?: PossessionType
  effect?: EffectType
  attributes?: string[]
}): ACRule {
  const args: [ActionType, string, PossessionType?, EffectType?, string[]?] = [
    rule.action,
    rule.resource,
  ]
  if (rule.possession) {
    args.push(rule.possession)
  }
  if (rule.effect) {
    args.push(rule.effect)
  }
  if (rule.attributes) {
    args.push(rule.attributes)
  }
  return new ACRule(...args)
}

export function isRule (obj: any): obj is ACRule {
  return (
    typeof obj === 'object' &&
    !!obj &&
    'effect' in obj &&
    'resource' in obj &&
    'action' in obj &&
    'possession' in obj &&
    'attributes' in obj
  )
}
