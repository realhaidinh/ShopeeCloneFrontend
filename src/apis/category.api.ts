import { CategoryListResponse } from 'src/types/category.type'
import http from 'src/utils/http'

const URL = 'categories'
const categoryApi = {
  getCategories: () => {
    return http.get<CategoryListResponse>(URL)
  },
  getChildrenCategories: (parentCategoryId: number) => {
    return http.get<CategoryListResponse>(`${URL}?parentCategoryId=${parentCategoryId}`)
  }
}

export default categoryApi
