export type ResultSuccess<TData> = {
  success: true
  data: TData
}

export type ResultFailed<TError> = {
  success: false
  error: TError
}

export type Result<TData, TError> = ResultSuccess<TData> | ResultFailed<TError>
