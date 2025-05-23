import { BrandTranslation, CreateBrandTranslationReqBody, UpdateBrandTranslationReqBody } from 'src/types/brand.type'
import http from 'src/utils/http'

const URL = 'brand-translations'
const brandTranslationApi = {
  getDetail: (id: number) => {
    return http.get<BrandTranslation>(`${URL}/${id}`)
  },
  create: (body: CreateBrandTranslationReqBody) => {
    return http.post<BrandTranslation>(`${URL}`, body)
  },
  update: (id: number, body: UpdateBrandTranslationReqBody) => {
    return http.put<BrandTranslation>(`${URL}/${id}`, body)
  },
  delete: (id: number) => {
    return http.delete<{ message: string }>(`${URL}/${id}`)
  }
}

export default brandTranslationApi
