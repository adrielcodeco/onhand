export type EffectType = 'allow' | 'denny'

export enum ACEffect {
  'allow' = 'allow',
  'denny' = 'denny',
}

export function effectParse (effect: string): ACEffect {
  switch (effect.toLowerCase()) {
    case 'allow':
      return ACEffect.allow
    case 'denny':
      return ACEffect.denny
  }
  throw new Error('invalid effect')
}
