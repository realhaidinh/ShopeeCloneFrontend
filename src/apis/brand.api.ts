import { Brand, BrandListResponse, CreateBrandReqBody, UpdateBrandReqBody } from 'src/types/brand.type'
import { UploadImageResponse } from 'src/types/media.type'
import http from 'src/utils/http'

const URL = 'brands'
const brandApi = {
  getBrands: (params?: { page: number; limit: number }) => {
    return http.get<BrandListResponse>(URL, { params })
  },
  getDetailBrand: (id: number) => {
    return http.get<Brand>(`${URL}/${id}`)
  },
  create: (body: CreateBrandReqBody) => {
    return http.post<Brand>(`${URL}`, body)
  },
  update: (id: number, body: UpdateBrandReqBody) => {
    return http.put<Brand>(`${URL}/${id}`, body)
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
export default brandApi
