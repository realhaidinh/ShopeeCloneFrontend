export interface ResponseApi<Data> {
  message: string
  data?: Data
}

export interface ResponseUnprocessableEntityApi<T> {
  error: string
  statusCode: number
  message: {
    path: keyof T
    message: string
  }[]
}

export interface NotFoundApi {
  error: string
  statusCode: number
  message: string
}
