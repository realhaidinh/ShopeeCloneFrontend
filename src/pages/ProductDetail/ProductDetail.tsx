'use client'

import type React from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Avatar, Button, Divider, Rate, Spin, Tag } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Link, useNavigate, useParams } from 'react-router-dom'
import productApi from 'src/apis/product.api'
import QuantityController from 'src/components/QuantityController'
import Product from 'src/pages/ProductList/Product'
import type { ProductListConfig, Sku } from 'src/types/product.type'
import { formatCurrency, formatDate, formatNumberToSocialStyle, getIdFromNameId, rateSale } from 'src/utils/utils'
import purchaseApi from 'src/apis/purchaseApi'
import { toast } from 'react-toastify'
import type { StatisticTimerProps } from 'antd'
import { Statistic } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import userApi from 'src/apis/user.api'

import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  MessageOutlined,
  ShopOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import ProductReviewList from 'src/pages/ProductDetail/ProductReviewList'

const { Timer } = Statistic

export default function ProductDetail() {
  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const { nameId } = useParams()
  const [deadline, setDeadline] = useState(Date.now() + 1000 * 60 * 60) // 1 phút
  const [buyCount, setBuyCount] = useState(1)
  const id = getIdFromNameId(nameId as string)
  const { data: productDetailData } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductDetail(id as string),
    staleTime: 1 * 60 * 1000
  })

  const addToCartMutation = useMutation(purchaseApi.addToCart)

  const product = productDetailData
  const [selectedSKU, setSelectedSKU] = useState<Sku>({} as Sku)

  const { data: shopData, isLoading: isShopLoading } = useQuery({
    queryKey: ['shop', product?.data.createdById],
    queryFn: () => {
      return userApi.detail(Number(product?.data.createdById))
    },
    keepPreviousData: true,
    staleTime: 3 * 60 * 1000
  })

  // Set default selected SKU when product data is loaded
  useEffect(() => {
    if (product && product.data.skus.length > 0) {
      setSelectedSKU(product.data.skus[0])
    }
  }, [product])

  const productImages: string[] = []
  if (productDetailData?.data) {
    productImages.push(...productDetailData.data.images)
    productDetailData.data.skus.forEach((sku) => {
      if (sku.image) productImages.push(sku.image)
    })
  }

  //Hiển thị 1 lần 5 ảnh
  const [currentIndexImages, setCurrentIndexImages] = useState([0, 5])
  const [activeImage, setActiveImage] = useState('')

  const currentImages = useMemo(
    () => (product ? productImages.slice(...currentIndexImages) : []),
    [product, currentIndexImages, productImages]
  )

  useEffect(() => {
    if (product && productImages.length > 0) {
      setActiveImage(productImages[0])
    }
  }, [product])

  const next = () => {
    if (currentIndexImages[1] < productImages.length) {
      setCurrentIndexImages((prev) => [prev[0] + 1, prev[1] + 1])
    }
  }

  const prev = () => {
    if (currentIndexImages[0] > 0) {
      setCurrentIndexImages((prev) => [prev[0] - 1, prev[1] - 1])
    }
  }

  const chooseActive = (img: string) => {
    setActiveImage(img)
  }

  const imageRef = useRef<HTMLImageElement>(null)

  const queryConfig: ProductListConfig = {
    limit: '20',
    page: '1',
    categories: product?.data.categories.map((item) => item.id)
  }
  const { data: productData } = useQuery({
    queryKey: ['products', queryConfig],
    queryFn: () => {
      return productApi.getProducts(queryConfig)
    },
    enabled: Boolean(product),
    staleTime: 3 * 60 * 1000
  })

  const handleZoom = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const image = imageRef.current as HTMLImageElement
    const { naturalHeight, naturalWidth } = image
    // Cách 1: Lấy offsetX, offsetY đơn giản khi chúng ta đã xử lý được bubble event
    // const { offsetX, offsetY } = event.nativeEvent

    // Cách 2: Lấy offsetX, offsetY khi chúng ta không xử lý được bubble event
    const offsetX = event.pageX - (rect.x + window.scrollX)
    const offsetY = event.pageY - (rect.y + window.scrollY)

    const top = offsetY * (1 - naturalHeight / rect.height)
    const left = offsetX * (1 - naturalWidth / rect.width)
    image.style.width = naturalWidth + 'px'
    image.style.height = naturalHeight + 'px'
    image.style.maxWidth = 'unset'
    image.style.top = top + 'px'
    image.style.left = left + 'px'
  }

  const handleRemoveZoom = () => {
    imageRef.current?.removeAttribute('style')
  }

  const onFinish: StatisticTimerProps['onFinish'] = () => {
    setDeadline(Date.now() + 1000 * 60 * 60) // +1 phút nữa
  }

  const handleBuyCount = (value: number) => {
    setBuyCount(value)
  }

  const handleAddToCart = () => {
    // console.log({
    //   quantity: buyCount,
    //   skuId: selectedSKU.id
    // })
    addToCartMutation.mutate(
      {
        quantity: buyCount,
        skuId: selectedSKU.id
      },
      {
        onSuccess: () => {
          toast.success('Add to cart successfully', {
            autoClose: 1300
          })
          queryClient.invalidateQueries({ queryKey: ['purchases'] })
        }
      }
    )
  }

  return product ? (
    <div className='bg-gray-200 py-6'>
      <div className='container'>
        <div className='bg-white p-4 shadow'>
          <div className='grid grid-cols-12 gap-9'>
            <div className='col-span-5'>
              <div
                className='relative w-full cursor-zoom-in overflow-hidden pt-[100%] shadow'
                onMouseMove={handleZoom}
                onMouseLeave={handleRemoveZoom}
              >
                <img
                  src={activeImage || '/placeholder.svg'}
                  alt={product.data.name}
                  className='absolute top-0 left-0 h-full w-full bg-white object-cover'
                  ref={imageRef}
                />
              </div>
              <div className='relative mt-4 grid grid-cols-5 gap-1'>
                <button
                  onClick={prev}
                  className='absolute left-0 top-1/2 z-10 h-9 w-5 -translate-y-1/2 bg-black/20 text-white'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-5 w-5'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
                  </svg>
                </button>
                {currentImages.map((img) => {
                  const isActive = img === activeImage
                  return (
                    <div className='relative w-full pt-[100%]' key={img} onMouseEnter={() => chooseActive(img)}>
                      <img
                        src={img || '/placeholder.svg'}
                        alt={product.data.name}
                        className='absolute top-0 left-0 h-full w-full cursor-pointer bg-white object-cover'
                      />
                      {isActive && <div className='absolute inset-0 border-2 border-orange' />}
                    </div>
                  )
                })}
                <button
                  onClick={next}
                  className='absolute right-0 top-1/2 z-10 h-9 w-5 -translate-y-1/2 bg-black/20 text-white'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='h-5 w-5'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
                  </svg>
                </button>
              </div>
            </div>
            <div className='col-span-7'>
              <h1 className='text-xl font-medium uppercase'>
                {product.data.productTranslations[0]?.name || 'Product Name'}
              </h1>
              <div className='mt-8 flex items-center'>
                <div className='flex items-center'>
                  <span className='mr-1 border-b border-b-orange text-orange'>{4.7}</span>
                  <Rate style={{ fontSize: '0.75rem' }} allowHalf disabled defaultValue={4.7} />
                </div>
                <div className='mx-4 h-4 w-[1px] bg-gray-300'></div>
                <div>
                  <span>
                    {formatNumberToSocialStyle(
                      product.data.productSKUSnapshots?.reduce((prev, next) => prev + next.quantity, 0) || 0
                    )}
                  </span>
                  <span className='ml-1 text-gray-500'>Đã bán</span>
                </div>
                <div className='mx-4 h-4 w-[1px] bg-gray-300'></div>
                <div>
                  <span>{product.data.skus.reduce((prev, next) => prev + next.stock, 0)}</span>
                  <span className='ml-1 text-gray-500'>Sản phẩm</span>
                </div>
              </div>

              <div className='mt-8 flex items-center justify-between bg-orange p-2 '>
                <img
                  src='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/productdetailspage/8eebfcdc539676df4457.svg'
                  alt=''
                />
                <div className='flex items-center gap-3'>
                  <ClockCircleOutlined style={{ color: 'white' }} />
                  <span className='uppercase text-white'>Kết thúc trong: </span>
                  <Timer type='countdown' value={deadline} onFinish={onFinish} valueStyle={{ color: 'white' }} />
                </div>
              </div>

              <div className='flex items-center bg-gray-50 px-5 py-4'>
                <div className='text-gray-500 line-through'>₫{formatCurrency(product.data.virtualPrice)}</div>
                <div className='ml-3 text-3xl font-medium text-orange'>₫{formatCurrency(selectedSKU.price)}</div>
                <div className='ml-4 rounded-sm bg-orange px-1 py-[2px] text-xs font-semibold uppercase text-white'>
                  {rateSale(product.data.virtualPrice, selectedSKU.price)} giảm
                </div>
              </div>

              <div className='mt-8'>
                <div className='mb-3 font-medium capitalize text-gray-500'>Phân loại:</div>
                <div className='flex flex-wrap gap-3'>
                  {product.data.skus.map((sku) => (
                    <button
                      key={sku.id}
                      onClick={() => setSelectedSKU(sku)}
                      className={`relative rounded-md border px-4 py-2 transition-all ${
                        selectedSKU?.id === sku.id
                          ? 'border-orange bg-orange/5 font-medium text-orange'
                          : 'border-gray-300 text-gray-700 hover:border-orange/50 hover:shadow-sm'
                      } ${sku.stock === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                      disabled={sku.stock === 0}
                    >
                      {sku.value}
                      {sku.stock === 0 && <span className='ml-1 text-xs text-gray-500'>(Hết hàng)</span>}
                      {selectedSKU?.id === sku.id && (
                        <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange text-[10px] text-white'>
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className='mt-8 flex items-center'>
                <div className='capitalize text-gray-500'>Số lượng</div>
                <div className='ml-10 flex items-center'>
                  <QuantityController max={selectedSKU?.stock || 0} setBuyCount={setBuyCount} value={buyCount} />
                </div>
                <div className='ml-6 text-sm text-gray-500'>{selectedSKU?.stock || 0} sản phẩm có sẵn</div>
              </div>

              <div className='mt-8 flex items-center'>
                <button
                  onClick={handleAddToCart}
                  className='flex h-12 items-center justify-center rounded-sm border border-orange bg-orange/10 px-5 capitalize text-orange shadow-sm hover:bg-orange/5'
                >
                  <svg
                    enableBackground='new 0 0 15 15'
                    viewBox='0 0 15 15'
                    x={0}
                    y={0}
                    className='mr-[10px] h-5 w-5 fill-current stroke-orange text-orange'
                  >
                    <g>
                      <g>
                        <polyline
                          fill='none'
                          points='.5 .5 2.7 .5 5.2 11 12.4 11 14.5 3.5 3.7 3.5'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeMiterlimit={10}
                        />
                        <circle cx={6} cy='13.5' r={1} stroke='none' />
                        <circle cx='11.5' cy='13.5' r={1} stroke='none' />
                      </g>
                      <line fill='none' strokeLinecap='round' strokeMiterlimit={10} x1='7.5' x2='10.5' y1={7} y2={7} />
                      <line fill='none' strokeLinecap='round' strokeMiterlimit={10} x1={9} x2={9} y1='8.5' y2='5.5' />
                    </g>
                  </svg>
                  Thêm vào giỏ hàng
                </button>
                <button className='fkex ml-4 h-12 min-w-[5rem] items-center justify-center rounded-sm bg-orange px-5 capitalize text-white shadow-sm outline-none hover:bg-orange/90'>
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {shopData && shopData.data && (
        <div className='mt-8'>
          <div className='container'>
            <div className='rounded-lg bg-white p-6 shadow-lg'>
              <div className='flex flex-col gap-6 md:flex-row'>
                {/* Shop Avatar & Basic Info */}
                <div className='flex flex-1 flex-col items-center gap-4 md:flex-row md:items-start'>
                  <Link to={`/shop/${shopData.data.id}`}>
                    <Avatar
                      size={120}
                      icon={<UserOutlined />}
                      src={shopData.data.avatar || undefined}
                      className='border-4 border-white shadow-lg'
                    />
                  </Link>

                  <div className='flex-1 text-center md:text-left'>
                    <div className='mb-2 flex flex-col gap-2 md:flex-row md:items-center'>
                      <Link to={`/shop/${shopData.data.id}`}>
                        <h1 className='text-2xl font-bold text-gray-800'>{shopData.data.name}</h1>
                      </Link>

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
                  <Button
                    icon={<MessageOutlined />}
                    size='large'
                    className='border-orange-500 text-orange-500 hover:border-orange-600 hover:text-orange-600'
                    onClick={() => navigate(`/chat/${shopData.data.id}`)}
                  >
                    Chat ngay
                  </Button>
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

      <div className='mt-8'>
        <div className='container'>
          <div className='mt-8 bg-white p-4 shadow'>
            <div className='rounded bg-gray-50 p-4 text-lg capitalize text-slate-700'>Mô tả sản phẩm</div>

            <div className='mx-4 mt-6 mb-4 text-sm leading-loose'>
              {product.data.productTranslations[0]?.description || 'Description'}
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews Section */}
      <div className='container'>
        <ProductReviewList
          productId={product.data.id}
          productName={product.data.productTranslations[0]?.name || 'Product Name'}
          productImage={product.data.images[0] || '/placeholder.svg'}
          currentUserId={1} // You should get this from your auth context
        />
      </div>

      <div className='mt-8'>
        <div className='container'>
          <div className='uppercase text-gray-400'>Sản phẩm liên quan</div>
          {productData && (
            <div className='mt-6 grid grid-cols-2 gap-3 md:grid-cols-4  lg:grid-cols-5 xl:grid-cols-6'>
              {productData.data.data.map((product) => (
                <div key={product.id} className='col-span-1'>
                  <Product product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className='container flex min-h-[300px] items-center justify-center'>
      <Spin size='large' />
    </div>
  )
}
