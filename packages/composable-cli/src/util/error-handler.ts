const makeErrorWrapper =
  <T>(errorHandler: (err: unknown) => T) =>
  <A extends any[], R extends object>(fn: (...a: A) => Promise<R>) =>
  async (...a: A): Promise<void> => {
    try {
      const result = await fn(...a)

      if (isResultError(result)) {
        return Promise.reject(result.error)
      }

      return Promise.resolve()
    } catch (err) {
      await errorHandler(err)
      return Promise.resolve()
    }
  }

function isResultError(
  result: any
): result is { success: false; error: unknown } {
  return (
    !!result &&
    "success" in result &&
    typeof result.success === "boolean" &&
    !result.success
  )
}

export const handleErrors = makeErrorWrapper((err) => {
  if (err instanceof Error) {
    console.error(err.name)
    console.error(err.message)
    console.error(err.stack)
    console.error(err.cause)
    return Promise.resolve()
  }
  console.error("There was an unexpected error!")
  return Promise.resolve()
})
