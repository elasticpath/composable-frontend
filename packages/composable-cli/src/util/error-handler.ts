import { logging } from "@angular-devkit/core"
import { Result } from "../types/results"

export type ErrorHandler = <A extends any[], X, Y, R extends Result<X, Y>>(
  fn: (...a: A) => Promise<R>,
) => (...a: A) => Promise<void>

export const makeErrorWrapper =
  <T, X, Y, R extends Result<X, Y>>(
    errorHandler: (err: unknown, logger: logging.Logger) => T,
    resultHandler: (result: R) => Promise<void> | void,
    logger: logging.Logger,
  ) =>
  <A extends any[]>(fn: (...a: A) => Promise<R>) =>
  async (...a: A): Promise<void> => {
    try {
      const result = await fn(...a)

      if (isResultError(result)) {
        await errorHandler(result.error, logger)
      }
      await resultHandler(result)
      return Promise.resolve()
    } catch (err) {
      await errorHandler(err, logger)
      return Promise.resolve()
    }
  }

function isResultError(
  result: any,
): result is { success: false; error: unknown } {
  return (
    !!result &&
    "success" in result &&
    typeof result.success === "boolean" &&
    !result.success
  )
}
