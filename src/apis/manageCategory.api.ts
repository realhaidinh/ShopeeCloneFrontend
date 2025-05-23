import { Category, CategoryListResponse, CreateCategoryReqBody, UpdateCategoryReqBody } from 'src/types/category.type'
import { UploadImageResponse } from 'src/types/media.type'
import http from 'src/utils/http'

const URL = 'categories'
const categoryApi = {
  getParentCategories: () => {
    return http.get<CategoryListResponse>(URL)
  },
  getChildrenCategories: (parentCategoryId: number) => {
    if (!parentCategoryId) return
    return http.get<CategoryListResponse>(`${URL}?parentCategoryId=${parentCategoryId}`)
  },
  getDetailCategory: (id: number) => {
    if (!id) return
    return http.get<Category>(`${URL}/${id}`)
  },
  create: (body: CreateCategoryReqBody) => {
    if (body.parentCategoryId === undefined) body.parentCategoryId = null
    return http.post<Category>(`${URL}`, body)
  },
  update: (id: number, body: UpdateCategoryReqBody) => {
    if (body.parentCategoryId === undefined) body.parentCategoryId = null
    return http.put<Category>(`${URL}/${id}`, body)
  },
  delete: (id: number) => {
    return http.delete<{ message: string }>(`${URL}/${id}`)
  },
  uploadImages(files: File[]) {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file) // key 'files' khớp với backend yêu cầu
    })
    return http.post<UploadImageResponse>(`/media/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default categoryApi
