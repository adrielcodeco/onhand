export async function throttling<T> (
  action: () => Promise<T>,
  retry = 0,
): Promise<T> {
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
