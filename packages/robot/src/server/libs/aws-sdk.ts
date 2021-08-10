export async function throttling<R> (
  action: () => Promise<R>,
  retry = 0,
): Promise<R> {
  try {
    const result = await action()
    return result
  } catch (err: any) {
    if (retry < 5 && /Rate exceeded/.test(err.toString())) {
      return throttling(action, ++retry)
    }
    throw err
  }
}
