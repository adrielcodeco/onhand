import React from 'react'
import { In } from '~/components/templates/in'
import { Out } from '~/components/templates/out'

export function Container ({ children }: any) {
  const projectId = localStorage.getItem('current-project')
  return projectId ? <In>{children}</In> : <Out>{children}</Out>
}
