import {
  CategoryTranslation,
  CreateCategoryTranslationReqBody,
  UpdateCategoryTranslationReqBody
} from 'src/types/category.type'
import http from 'src/utils/http'

const URL = 'category-translations'
const categoryTranslationApi = {
  getDetail: (id: number) => {
    return http.get<CategoryTranslation>(`${URL}/${id}`)
  },
  create: (body: CreateCategoryTranslationReqBody) => {
    return http.post<CategoryTranslation>(`${URL}`, body)
  },
  update: (id: number, body: UpdateCategoryTranslationReqBody) => {
    return http.put<CategoryTranslation>(`${URL}/${id}`, body)
  },
  delete: (id: number) => {
    return http.delete<{ message: string }>(`${URL}/${id}`)
  }
}

export default categoryTranslationApi
