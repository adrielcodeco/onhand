export const logIfPermitted = (verbose: boolean) => {
  return verbose ? console.log : (...data: any[]) => undefined
}
