export type FailureOpResult = {
  success: false
  error: Error
}

export type SuccessOpResult<T> = {
  success: true
} & T

export type OperationResult<T> = SuccessOpResult<T> | FailureOpResult
