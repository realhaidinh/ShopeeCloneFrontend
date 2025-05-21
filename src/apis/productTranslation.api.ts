import {
  CreateProductTranslationReqBody,
  ProductTranslation,
  UpdateProductTranslationReqBody
} from 'src/types/product.type'
import http from 'src/utils/http'

const URL = 'product-translations'

export const productTranslationApi = {
  create: (body: CreateProductTranslationReqBody) => {
    return http.post<ProductTranslation>(`${URL}`, body)
  },
  update: (id: number, body: UpdateProductTranslationReqBody) => {
    return http.put<ProductTranslation>(`${URL}/${id}`, body)
  },
  delete: (id: number) => {
    return http.delete<{ message: string }>(`${URL}/${id}`)
  },
  detail: (id: number) => {
    return http.get<ProductTranslation>(`${URL}/${id}`)
  }
}
