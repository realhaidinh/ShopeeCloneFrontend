import { Category, CategoryListResponse } from 'src/types/category.type'
import http from 'src/utils/http'

const URL = 'categories'
const categoryApi = {
  getCategories: () => {
    return http.get<CategoryListResponse>(URL)
  },
  getChildrenCategories: (parentCategoryId: number) => {
    if (!parentCategoryId) return
    return http.get<CategoryListResponse>(`${URL}?parentCategoryId=${parentCategoryId}`)
  },
  getDetailCategory: (id: number) => {
    if (!id) return
    return http.get<Category>(`${URL}/${id}`)
  }
}

export default categoryApi
