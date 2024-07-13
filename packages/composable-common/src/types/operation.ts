export type OperationResult<T = Record<string, unknown>, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }
