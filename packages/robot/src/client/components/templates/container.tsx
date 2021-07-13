import React from 'react'
import { In } from '~/components/templates/in'
import { Out } from '~/components/templates/out'

export function Container ({ children }: any) {
  const session = { user: undefined }
  return session.user ? <In>{children}</In> : <Out>{children}</Out>
}
