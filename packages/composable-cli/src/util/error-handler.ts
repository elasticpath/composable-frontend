const makeErrorWrapper =
  <T>(errorHandler: (err: any) => T) =>
  <A extends any[], R>(fn: (...a: A) => Promise<R>) =>
  async (...a: A): Promise<void> => {
    try {
      await fn(...a)
      return Promise.resolve()
    } catch (err) {
      await errorHandler(err)
      return Promise.resolve()
    }
  }

export const handleErrors = makeErrorWrapper(() => {
  console.error("There was an unexpected error!")
  return Promise.resolve()
})
