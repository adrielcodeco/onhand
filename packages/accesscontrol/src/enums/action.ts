export type ActionType = 'create' | 'read' | 'update' | 'delete'

export enum ACAction {
  'create' = 'create',
  'read' = 'read',
  'update' = 'update',
  'delete' = 'delete',
}

export function actionParse (action: string): ACAction {
  switch (action.toLowerCase()) {
    case 'create':
      return ACAction.create
    case 'read':
      return ACAction.read
    case 'update':
      return ACAction.update
    case 'delete':
      return ACAction.delete
  }
  throw new Error('invalid action')
}
