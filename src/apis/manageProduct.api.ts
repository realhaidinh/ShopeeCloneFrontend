import { UploadImageResponse } from 'src/types/media.type'
import { CreateProductReqBody, Product, UpdateProductReqBody } from 'src/types/product.type'
import http from 'src/utils/http'

const URL = 'manage-product/products'

export const manageProductApi = {
  create: (body: CreateProductReqBody) => {
    return http.post<Product>(`${URL}`, body)
  },
  update: (id: number, body: UpdateProductReqBody) => {
    return http.put<Product>(`${URL}/${id}`, body)
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
