import React from 'react'
import { render } from '#/server/render'
import { Container } from '#/client/layouts/container'

function Manager() {
  return (
    <Container>
      <div>Manager</div>
    </Container>
  )
}

export default render(Manager)
