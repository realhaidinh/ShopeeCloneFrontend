import {
  CreateReviewReqBody,
  CreateReviewResBody,
  ListReview,
  UpdateReviewReqBody,
  UpdateReviewResBody,
  UploadImageResponse
} from 'src/types/review.type'
import http from 'src/utils/http'
const URL = 'reviews'

const reviewApi = {
  getList: (productId: number, params: { page: number; limit: number }) => {
    return http.get<ListReview>(`${URL}/products/${productId}`, { params })
  },
  create: (body: CreateReviewReqBody) => {
    return http.post<CreateReviewResBody>(URL, body)
  },
  update: (id: number, body: UpdateReviewReqBody) => {
    return http.put<UpdateReviewResBody>(`${URL}/${id}`, body)
  },
  detail: (id: number) => {
    return http.get<UpdateReviewResBody>(`${URL}/${id}`)
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

export default reviewApi
