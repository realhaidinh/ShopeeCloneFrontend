import { useState } from 'react'
import { Card, Button, Empty, Typography, Divider, Space, Alert } from 'antd'
import { StarOutlined, EditOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import reviewApi from 'src/apis/review.api'
import type { CreateReviewResBody } from 'src/types/review.type'
import ProductReviewDisplay from 'src/components/ProductReviewDisplay'
import ProductReviewForm from 'src/components/ProductReviewForm'

const { Title, Text } = Typography

interface ProductReviewSectionProps {
  orderId: number
  orderStatus: string
  products: Array<{
    id: number
    productId: number
    productName: string
    image: string
    skuValue: string
    quantity: number
    skuPrice: number
  }>
  userId: number
}

interface ProductReview {
  productId: number
  review: CreateReviewResBody | null
}

export default function ProductReviewSection({ orderId, orderStatus, products, userId }: ProductReviewSectionProps) {
  const [reviewFormVisible, setReviewFormVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number
    name: string
    image: string
  } | null>(null)
  const [reviewMode, setReviewMode] = useState<'create' | 'edit'>('create')
  const [selectedReview, setSelectedReview] = useState<CreateReviewResBody | null>(null)

  // Fetch reviews for all products in this order
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['orderReviews', orderId],
    queryFn: async () => {
      const reviewPromises = products.map(async (product) => {
        try {
          // Get reviews for this product and filter by orderId and userId
          const response = await reviewApi.getList(product.productId, { page: 1, limit: 100 })
          const userOrderReview = response.data.data.find(
            (review) => review.orderId === orderId && review.userId === userId
          )
          return {
            productId: product.productId,
            review: userOrderReview || null
          }
        } catch (error) {
          return {
            productId: product.productId,
            review: null
          }
        }
      })

      return Promise.all(reviewPromises)
    },
    enabled: orderStatus === 'DELIVERED' && products.length > 0
  })

  const productReviews: ProductReview[] = reviewsData || []

  const handleCreateReview = (product: { productId: number; productName: string; image: string }) => {
    setSelectedProduct({
      id: product.productId,
      name: product.productName,
      image: product.image
    })
    setReviewMode('create')
    setSelectedReview(null)
    setReviewFormVisible(true)
  }

  const handleEditReview = (
    product: { productId: number; productName: string; image: string },
    review: CreateReviewResBody
  ) => {
    setSelectedProduct({
      id: product.productId,
      name: product.productName,
      image: product.image
    })
    setReviewMode('edit')
    setSelectedReview(review)
    setReviewFormVisible(true)
  }

  const handleCloseReviewForm = () => {
    setReviewFormVisible(false)
    setSelectedProduct(null)
    setSelectedReview(null)
  }

  // Don't show review section if order is not delivered
  if (orderStatus !== 'DELIVERED') {
    return null
  }

  return (
    <Card
      title={
        <div className='flex items-center space-x-2'>
          <StarOutlined className='text-yellow-500' />
          <span>Đánh giá sản phẩm</span>
        </div>
      }
    >
      {products.length === 0 ? (
        <Empty description='Không có sản phẩm để đánh giá' />
      ) : (
        <div className='space-y-4'>
          <Alert
            message='Đánh giá sản phẩm'
            description='Bạn có thể đánh giá các sản phẩm trong đơn hàng đã giao thành công. Mỗi đánh giá chỉ có thể chỉnh sửa tối đa 1 lần.'
            type='info'
            showIcon
            className='mb-4'
          />

          {products.map((product) => {
            const productReview = productReviews.find((pr) => pr.productId === product.productId)
            const hasReview = productReview?.review

            return (
              <div key={product.id} className='rounded-lg border p-4'>
                <div className='mb-3 flex items-start justify-between'>
                  <div className='flex items-center space-x-3'>
                    <img
                      src={product.image || '/placeholder.svg'}
                      alt={product.productName}
                      className='h-16 w-16 rounded object-cover'
                    />
                    <div>
                      <Text strong className='text-base'>
                        {product.productName}
                      </Text>
                      <div className='text-sm text-gray-500'>
                        Phân loại: {product.skuValue} | Số lượng: {product.quantity}
                      </div>
                    </div>
                  </div>

                  {!hasReview ? (
                    <Button
                      type='primary'
                      icon={<StarOutlined />}
                      onClick={() =>
                        handleCreateReview({
                          productId: product.productId,
                          productName: product.productName,
                          image: product.image
                        })
                      }
                      className='bg-blue-500 hover:bg-blue-600'
                    >
                      Đánh giá
                    </Button>
                  ) : (
                    <Space>
                      <Text type='success' className='text-sm'>
                        Đã đánh giá
                      </Text>
                      {hasReview.updateCount < 1 && (
                        <Button
                          type='text'
                          icon={<EditOutlined />}
                          onClick={() =>
                            handleEditReview(
                              {
                                productId: product.productId,
                                productName: product.productName,
                                image: product.image
                              },
                              hasReview
                            )
                          }
                          className='text-blue-500'
                        >
                          Chỉnh sửa
                        </Button>
                      )}
                    </Space>
                  )}
                </div>

                {hasReview && (
                  <>
                    <Divider className='my-3' />
                    <ProductReviewDisplay
                      review={hasReview}
                      onEdit={() =>
                        handleEditReview(
                          {
                            productId: product.productId,
                            productName: product.productName,
                            image: product.image
                          },
                          hasReview
                        )
                      }
                      canEdit={hasReview.updateCount < 1}
                    />
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {selectedProduct && (
        <ProductReviewForm
          visible={reviewFormVisible}
          onCancel={handleCloseReviewForm}
          productId={selectedProduct.id}
          orderId={orderId}
          productName={selectedProduct.name}
          productImage={selectedProduct.image}
          existingReview={selectedReview}
          mode={reviewMode}
        />
      )}
    </Card>
  )
}
