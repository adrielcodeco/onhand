type Status = 'success' | 'fail' | 'error'

export type Response<T> = {
  status: Status
  data?: T | undefined
  message?: string
  code?: string
}

export type SuccessResponse<T> = {
  status: 'success'
  data: T | undefined
}

export type FailResponse<T> = {
  status: 'fail'
  data: T | undefined
}

export type ErrorResponse<T> = {
  status: 'error'
  message: string
  code?: string
  data?: T | undefined
}
