import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Avatar, Divider, Empty, Spin, Tag, Button } from 'antd'
import { useContext, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import productApi from 'src/apis/product.api'
import userApi from 'src/apis/user.api'
import useQueryConfig from 'src/hooks/useQueryConfig'
import Product from 'src/pages/ProductList/Product'
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  MessageOutlined,
  ShopOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { formatDate } from 'src/utils/utils'
import { AppContext } from 'src/contexts/app.context'

const LIMIT = 10

export default function Shop() {
  const navigate = useNavigate()
  const { shopId } = useParams()
  const { profile } = useContext(AppContext)
  const queryConfig = useQueryConfig()
  if (shopId) {
    queryConfig.createdById = shopId
  }

  const { data: shopData, isLoading: isShopLoading } = useQuery({
    queryKey: ['shop', shopId],
    queryFn: () => {
      return userApi.detail(Number(shopId))
    },
    keepPreviousData: true,
    staleTime: 3 * 60 * 1000
  })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam = 1 }) => productApi.getProducts({ page: pageParam, limit: LIMIT, createdById: shopId }),
    getNextPageParam: (lastPage, allPages) => {
      const total = lastPage.data.totalItems
      const currentPage = allPages.length
      return currentPage * LIMIT < total ? currentPage + 1 : undefined
    },
    staleTime: 3 * 60 * 1000
  })

  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
      }
    )
    if (observerRef.current) {
      observer.observe(observerRef.current)
    }
    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current)
      }
    }
  }, [observerRef.current, hasNextPage, isFetchingNextPage])

  if (shopData && shopData.data.roleId === 2) {
    navigate('/not-found')
  }

  const totalProducts = data?.pages[0]?.data?.totalItems || 0

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Shop Header */}
      {isShopLoading && (
        <div className='flex items-center justify-center py-20'>
          <Spin size='large' />
        </div>
      )}

      {shopData?.data && shopData.data.roleId !== 2 && (
        <div className='bg-white'>
          {/* Shop Info Section */}
          <div className='relative z-10 mx-auto mt-10 max-w-7xl px-4'>
            <div className='rounded-lg bg-white p-6 shadow-lg'>
              <div className='flex flex-col gap-6 md:flex-row'>
                {/* Shop Avatar & Basic Info */}
                <div className='flex flex-1 flex-col items-center gap-4 md:flex-row md:items-start'>
                  <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    src={shopData.data.avatar || undefined}
                    className='border-4 border-white shadow-lg'
                  />

                  <div className='flex-1 text-center md:text-left'>
                    <div className='mb-2 flex flex-col gap-2 md:flex-row md:items-center'>
                      <h1 className='text-2xl font-bold text-gray-800'>{shopData.data.name}</h1>
                      <Tag color={shopData.data.status === 'ACTIVE' ? 'green' : 'red'} className='text-sm'>
                        {shopData.data.status}
                      </Tag>
                    </div>

                    <div className='mb-4 flex flex-col gap-4 text-sm text-gray-600 md:flex-row'>
                      <div className='flex items-center gap-1'>
                        <ShopOutlined />
                        <span>{shopData.data.role?.name}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <CalendarOutlined />
                        <span>Tham gia {formatDate(shopData.data.createdAt)}</span>
                      </div>
                    </div>

                    {/* Shop Stats */}
                    <div className='grid grid-cols-2 gap-4 text-center md:grid-cols-4'>
                      <div className='rounded-lg bg-gray-50 p-3'>
                        <div className='text-orange-500 text-lg font-semibold'>{totalProducts}</div>
                        <div className='text-xs text-gray-500'>Sản phẩm</div>
                      </div>
                      <div className='rounded-lg bg-gray-50 p-3'>
                        <div className='text-orange-500 text-lg font-semibold'>4.8</div>
                        <div className='text-xs text-gray-500'>Đánh giá</div>
                      </div>
                      <div className='rounded-lg bg-gray-50 p-3'>
                        <div className='text-orange-500 text-lg font-semibold'>98%</div>
                        <div className='text-xs text-gray-500'>Phản hồi</div>
                      </div>
                      <div className='rounded-lg bg-gray-50 p-3'>
                        <div className='text-orange-500 text-lg font-semibold'>1.2k</div>
                        <div className='text-xs text-gray-500'>Người theo dõi</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 md:w-48'>
                  {profile?.id !== shopData.data.id && (
                    <Button
                      icon={<MessageOutlined />}
                      size='large'
                      className='border-orange-500 text-orange-500 hover:border-orange-600 hover:text-orange-600'
                      onClick={() => navigate(`/chat/${shopData.data.id}`)}
                    >
                      Chat ngay
                    </Button>
                  )}
                </div>
              </div>

              {/* Shop Details */}
              <Divider className='my-6' />

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                <div className='rounded-lg bg-gray-50 p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <MailOutlined className='text-orange-500' />
                    <span className='font-medium text-gray-700'>Email liên hệ</span>
                  </div>
                  <p className='text-gray-600'>{shopData.data.email}</p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <PhoneOutlined className='text-orange-500' />
                    <span className='font-medium text-gray-700'>Số điện thoại</span>
                  </div>
                  <p className='text-gray-600'>{shopData.data.phoneNumber}</p>
                </div>

                <div className='rounded-lg bg-gray-50 p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <ClockCircleOutlined className='text-orange-500' />
                    <span className='font-medium text-gray-700'>Thời gian phản hồi</span>
                  </div>
                  <p className='text-gray-600'>Trong vài phút</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className='mx-auto max-w-7xl px-4 py-8'>
        {/* Section Header */}
        <div className='mb-6 rounded-lg bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='bg-orange-500 h-6 w-1 rounded'></div>
              <h2 className='text-xl font-semibold text-gray-800'>Tất cả sản phẩm</h2>
              <span className='text-gray-500'>({totalProducts} sản phẩm)</span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading && (
          <div className='flex items-center justify-center py-20'>
            <Spin size='large' />
          </div>
        )}

        {data && (
          <>
            {data.pages[0].data.data.length === 0 ? (
              <div className='rounded-lg bg-white p-20 shadow-sm'>
                <Empty description='Cửa hàng chưa có sản phẩm nào' image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
                {data.pages.map((page) =>
                  page.data.data.map((product) => (
                    <div
                      key={product.id}
                      className='overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-200 hover:shadow-md'
                    >
                      <Product product={product} />
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {isFetchingNextPage && (
          <div className='mt-8 flex items-center justify-center'>
            <Spin size='large' />
          </div>
        )}

        {/* Trigger load next page */}
        <div ref={observerRef} className='h-1'></div>
      </div>
    </div>
  )
}
