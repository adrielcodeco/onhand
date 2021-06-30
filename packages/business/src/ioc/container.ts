import { Container } from 'inversify'

const container = new Container({
  skipBaseClassChecks: true,
  autoBindInjectable: true,
})

function newContainerSandbox () {
  return Container.merge(container, new Container())
}

export { container, newContainerSandbox }
