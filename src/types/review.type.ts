import { MediaType } from 'src/constants/media.constant'

export type ReviewMedia = {
  id: number
  url: string
  type: MediaType //IMAGE | VIDEO
  reviewId: number
  createdAt: string
}

export type Review = {
  id: number
  content: string
  rating: number
  orderId: number
  productId: number
  userId: number
  updateCount: number
  createdAt: string
  updatedAt: string
}

export type ListReview = {
  data: CreateReviewResBody[]
  totalItems: number
  page: number
  limit: number
  totalPages: number
}

export type CreateReviewReqBody = {
  content: string
  rating: number
  productId: number
  orderId: number
  medias: Pick<ReviewMedia, 'url' | 'type'>[]
}

export type CreateReviewResBody = {
  id: number
  content: string
  rating: number
  orderId: number
  productId: number
  userId: number
  updateCount: number
  createdAt: string
  updatedAt: string
  medias: ReviewMedia[]
  user: {
    id: number
    name: string
    avatar: string
  }
}
export type UpdateReviewReqBody = {
  content: string
  rating: number
  productId: number
  orderId: number
  medias: Pick<ReviewMedia, 'url' | 'type'>[]
}

export type UpdateReviewResBody = {
  id: number
  content: string
  rating: number
  orderId: number
  productId: number
  userId: number
  updateCount: number
  createdAt: string
  updatedAt: string
  medias: ReviewMedia[]
  user: {
    id: number
    name: string
    avatar: string
  }
}

export interface UploadImageResponse {
  data: ImageData[]
}

export interface ImageData {
  url: string
}
