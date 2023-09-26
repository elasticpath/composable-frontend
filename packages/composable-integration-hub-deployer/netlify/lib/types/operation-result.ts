export type FailureOpResult = {
  success: false
  code?: string
  childCodes?: string[]
  error: Error
}

export type SuccessOpResult<T> = {
  success: true
} & T

export type OperationResult<T> = SuccessOpResult<T> | FailureOpResult
