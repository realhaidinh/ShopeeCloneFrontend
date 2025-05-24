/* eslint-disable jsx-a11y/media-has-caption */
'use client'

import { useState } from 'react'
import { Card, List, Rate, Typography, Avatar, Button, Pagination, Empty, Spin, Tag, Image } from 'antd'
import { UserOutlined, EditOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import reviewApi from 'src/apis/review.api'
import type { CreateReviewResBody } from 'src/types/review.type'
import ProductReviewForm from 'src/components/ProductReviewForm'

const { Text, Paragraph } = Typography

interface ProductReviewListProps {
  productId: number
  productName: string
  productImage: string
  currentUserId?: number
}

export default function ProductReviewList({
  productId,
  productName,
  productImage,
  currentUserId
}: ProductReviewListProps) {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [editingReview, setEditingReview] = useState<CreateReviewResBody | null>(null)
  const [reviewFormVisible, setReviewFormVisible] = useState(false)

  // Fetch reviews for this product
  const {
    data: reviewsData,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['reviews', productId, page, pageSize],
    queryFn: () => reviewApi.getList(productId, { page, limit: pageSize }),
    keepPreviousData: true
  })

  const reviews = reviewsData?.data?.data || []
  const totalReviews = reviewsData?.data?.totalItems || 0

  const handleEditReview = (review: CreateReviewResBody) => {
    setEditingReview(review)
    setReviewFormVisible(true)
  }

  const handleCloseReviewForm = () => {
    setReviewFormVisible(false)
    setEditingReview(null)
  }

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

  const ratingDistribution = getRatingDistribution()

  if (isLoading) {
    return (
      <Card title='Đánh giá sản phẩm' className='mt-8'>
        <div className='flex justify-center py-8'>
          <Spin size='large' tip='Đang tải đánh giá...' />
        </div>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card title='Đánh giá sản phẩm' className='mt-8'>
        <div className='py-8 text-center text-red-500'>Không thể tải đánh giá. Vui lòng thử lại sau.</div>
      </Card>
    )
  }

  return (
    <>
      <Card title='Đánh giá sản phẩm' className='mt-8'>
        {totalReviews > 0 ? (
          <>
            {/* Rating Summary */}
            <div className='mb-6 rounded-lg bg-gray-50 p-4'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Average Rating */}
                <div className='text-center'>
                  <div className='text-orange-500 mb-2 text-3xl font-bold'>{calculateAverageRating()}</div>
                  <Rate disabled value={Number.parseFloat(calculateAverageRating() as string)} className='mb-2' />
                  <div className='text-gray-500'>{totalReviews} đánh giá</div>
                </div>

                {/* Rating Distribution */}
                <div className='space-y-2'>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className='flex items-center space-x-2'>
                      <span className='w-8 text-sm'>{star} ⭐</span>
                      <div className='h-2 flex-1 rounded-full bg-gray-200'>
                        <div
                          className='bg-orange-500 h-2 rounded-full'
                          style={{
                            width:
                              totalReviews > 0
                                ? `${
                                    (ratingDistribution[star as keyof typeof ratingDistribution] / totalReviews) * 100
                                  }%`
                                : '0%'
                          }}
                        />
                      </div>
                      <span className='w-8 text-sm text-gray-500'>
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
              dataSource={reviews}
              renderItem={(review) => (
                <List.Item key={review.id} className='border-b border-gray-100 last:border-b-0'>
                  <div className='mb-3 flex items-start justify-between'>
                    <div className='flex items-center space-x-3'>
                      <Avatar src={review.user.avatar} icon={<UserOutlined />} size={40} />
                      <div>
                        <Text strong>{review.user.name}</Text>
                        <div className='flex items-center space-x-2'>
                          <Rate disabled value={review.rating} className='text-sm' />
                          <Text type='secondary' className='text-sm'>
                            {formatDate(review.createdAt)}
                          </Text>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center space-x-2'>
                      {review.updateCount > 0 && <Tag color='blue'>Đã chỉnh sửa {review.updateCount} lần</Tag>}
                      {currentUserId === review.userId && review.updateCount < 1 && (
                        <Button
                          type='text'
                          icon={<EditOutlined />}
                          onClick={() => handleEditReview(review)}
                          className='text-blue-500'
                        >
                          Chỉnh sửa
                        </Button>
                      )}
                    </div>
                  </div>

                  <Paragraph className='mb-3'>{review.content}</Paragraph>

                  {review.medias && review.medias.length > 0 && (
                    <div className='mb-3 grid grid-cols-4 gap-2'>
                      {review.medias.map((media, index) => (
                        <div key={media.id} className='relative'>
                          {media.type === 'IMAGE' ? (
                            <Image
                              src={media.url || '/placeholder.svg'}
                              alt={`Review media ${index + 1}`}
                              className='h-20 w-full rounded object-cover'
                            />
                          ) : (
                            <video src={media.url} className='h-20 w-full rounded object-cover' controls />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className='flex items-center space-x-4 text-gray-500'>
                    <Button type='text' icon={<LikeOutlined />} size='small'>
                      Hữu ích
                    </Button>
                    <Button type='text' icon={<DislikeOutlined />} size='small'>
                      Không hữu ích
                    </Button>
                  </div>
                </List.Item>
              )}
            />

            {/* Pagination */}
            {totalReviews > pageSize && (
              <div className='mt-6 flex justify-center'>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={totalReviews}
                  onChange={setPage}
                  showSizeChanger={false}
                  showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} đánh giá`}
                />
              </div>
            )}
          </>
        ) : (
          <Empty description='Chưa có đánh giá nào cho sản phẩm này' image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      {/* Edit Review Modal */}
      {editingReview && (
        <ProductReviewForm
          visible={reviewFormVisible}
          onCancel={handleCloseReviewForm}
          productId={productId}
          orderId={editingReview.orderId}
          productName={productName}
          productImage={productImage}
          existingReview={editingReview}
          mode='edit'
        />
      )}
    </>
  )
}
