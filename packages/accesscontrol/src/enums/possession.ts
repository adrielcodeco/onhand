export type PossessionType = 'any' | 'own'

export enum ACPossession {
  'any' = 'any',
  'own' = 'own',
}

export function possessionParse (possession: string): ACPossession {
  switch (possession.toLowerCase()) {
    case 'any':
      return ACPossession.any
    case 'own':
      return ACPossession.own
  }
  throw new Error('invalid possession')
}
