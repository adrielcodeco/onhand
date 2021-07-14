type Error = {
  code: string
  message: string
}

export const unknownError: Error = {
  code: 'SYS-001',
  message: 'unknown error.',
}
