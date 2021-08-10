const replaceState = (state: any) => {
  window.history.replaceState(state, document.title, window.location.href)
}

const setState = (key: string, value: any) => {
  const state = { ...(window.history.state ?? {}), [key]: value }
  replaceState(state)
}

const getState = () => {
  return window.history.state
}

export const stateService = {
  replaceState,
  setState,
  getState,
}
