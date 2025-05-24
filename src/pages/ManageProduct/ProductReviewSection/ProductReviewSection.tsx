/* eslint-disable jsx-a11y/media-has-caption */
import { useState } from 'react'
import {
  Card,
  List,
  Rate,
  Typography,
  Avatar,
  Button,
  Pagination,
  Empty,
  Spin,
  Tag,
  Image,
  Space,
  Popconfirm,
  message
} from 'antd'
import { UserOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FlagOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import reviewApi from 'src/apis/review.api'
import type { CreateReviewResBody } from 'src/types/review.type'

const { Text, Paragraph } = Typography

interface AdminProductReviewSectionProps {
  productId: number
  productName: string
}

export default function ProductReviewSection({ productId, productName }: AdminProductReviewSectionProps) {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5) // Smaller page size for admin view
  const queryClient = useQueryClient()

  // Fetch reviews for this product
  const {
    data: reviewsData,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['admin-reviews', productId, page, pageSize],
    queryFn: () => reviewApi.getList(productId, { page, limit: pageSize }),
    keepPreviousData: true
  })

  // Delete review mutation (if you have this API)
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => {
      // Assuming you have a delete API
      return fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      message.success('Đánh giá đã được xóa thành công!')
      queryClient.invalidateQueries({ queryKey: ['admin-reviews', productId] })
    },
    onError: () => {
      message.error('Không thể xóa đánh giá. Vui lòng thử lại.')
    }
  })

  const reviews = reviewsData?.data?.data || []
  const totalReviews = reviewsData?.data?.totalItems || 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    return (totalRating / reviews.length).toFixed(1)
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const handleDeleteReview = (reviewId: number) => {
    deleteReviewMutation.mutate(reviewId)
  }

  const handleViewReviewDetail = (review: CreateReviewResBody) => {
    // You can implement a detailed review modal here
    message.info(`Viewing review #${review.id}`)
  }

  const handleFlagReview = (reviewId: number) => {
    // You can implement review flagging/moderation here
    message.info(`Review #${reviewId} has been flagged for moderation`)
  }

  const ratingDistribution = getRatingDistribution()

  if (isLoading) {
    return (
      <div className='flex justify-center py-4'>
        <Spin size='large' tip='Đang tải đánh giá...' />
      </div>
    )
  }

  if (isError) {
    return <div className='py-4 text-center text-red-500'>Không thể tải đánh giá. Vui lòng thử lại sau.</div>
  }

  return (
    <div>
      {totalReviews > 0 ? (
        <>
          {/* Admin Review Summary */}
          <div className='mb-4 rounded bg-gray-50 p-3'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {/* Average Rating */}
              <div className='text-center'>
                <div className='text-orange-500 mb-1 text-2xl font-bold'>{calculateAverageRating()}</div>
                <Rate disabled value={Number.parseFloat(calculateAverageRating() as string)} className='mb-1' />
                <div className='text-sm text-gray-500'>{totalReviews} đánh giá</div>
              </div>

              {/* Quick Stats */}
              <div className='space-y-1'>
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className='flex items-center space-x-2 text-sm'>
                    <span className='w-6'>{star}⭐</span>
                    <div className='h-1.5 flex-1 rounded-full bg-gray-200'>
                      <div
                        className='bg-orange-500 h-1.5 rounded-full'
                        style={{
                          width:
                            totalReviews > 0
                              ? `${(ratingDistribution[star as keyof typeof ratingDistribution] / totalReviews) * 100}%`
                              : '0%'
                        }}
                      />
                    </div>
                    <span className='w-6 text-gray-500'>
                      {ratingDistribution[star as keyof typeof ratingDistribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <List
            itemLayout='vertical'
            size='small'
            dataSource={reviews}
            renderItem={(review) => (
              <List.Item key={review.id} className='border-b border-gray-100 last:border-b-0'>
                <div className='mb-2 flex items-start justify-between'>
                  <div className='flex items-center space-x-2'>
                    <Avatar src={review.user.avatar} icon={<UserOutlined />} size={32} />
                    <div>
                      <Text strong className='text-sm'>
                        {review.user.name}
                      </Text>
                      <div className='flex items-center space-x-2'>
                        <Rate disabled value={review.rating} className='text-xs' />
                        <Text type='secondary' className='text-xs'>
                          {formatDate(review.createdAt)}
                        </Text>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center space-x-1'>
                    <Tag color='blue' className='text-xs'>
                      ID: {review.id}
                    </Tag>
                    <Tag color='green' className='text-xs'>
                      Order: {review.orderId}
                    </Tag>
                    {review.updateCount > 0 && (
                      <Tag color='orange' className='text-xs'>
                        Đã sửa {review.updateCount}
                      </Tag>
                    )}
                  </div>
                </div>

                <Paragraph className='mb-2 text-sm' ellipsis={{ rows: 2, expandable: true }}>
                  {review.content}
                </Paragraph>

                {review.medias && review.medias.length > 0 && (
                  <div className='mb-2 grid grid-cols-6 gap-1'>
                    {review.medias.slice(0, 6).map((media, index) => (
                      <div key={media.id} className='relative'>
                        {media.type === 'IMAGE' ? (
                          <Image
                            src={media.url || '/placeholder.svg'}
                            alt={`Review media ${index + 1}`}
                            className='h-12 w-full rounded object-cover'
                            preview={{ mask: false }}
                          />
                        ) : (
                          <video src={media.url} className='h-12 w-full rounded object-cover' />
                        )}
                      </div>
                    ))}
                    {review.medias.length > 6 && (
                      <div className='flex h-12 items-center justify-center rounded bg-gray-100 text-xs text-gray-500'>
                        +{review.medias.length - 6}
                      </div>
                    )}
                  </div>
                )}
              </List.Item>
            )}
          />

          {/* Pagination */}
          {totalReviews > pageSize && (
            <div className='mt-4 flex justify-center'>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={totalReviews}
                onChange={setPage}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} đánh giá`}
                size='small'
              />
            </div>
          )}
        </>
      ) : (
        <Empty description='Chưa có đánh giá nào cho sản phẩm này' image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  )
}
