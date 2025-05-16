import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Form, Input, message, Steps, Card, Divider, Avatar, Collapse, List } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircleOutlined, HomeOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons'
import purchaseApi from 'src/apis/purchaseApi'
import { CartItemWithSKU, CheckoutItem, OrderResponse, Receiver, Shop } from 'src/types/purchase.type'
import { formatCurrency } from 'src/utils/utils'
import type { AxiosResponse } from 'axios'

const { Panel } = Collapse

interface CheckoutState {
  shopItems: Record<number, number[]>
  selectedItems: number[]
  cartItems: CartItemWithSKU[]
  shops: Shop[]
}

export default function Checkout() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutData, setCheckoutData] = useState<CheckoutState | null>(null)
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null)
  const [receiverInfo, setReceiverInfo] = useState<Receiver | null>(null)

  // Create order mutation - Now with proper typing
  const createOrderMutation = useMutation<AxiosResponse<OrderResponse>, Error, CheckoutItem[]>({
    mutationFn: purchaseApi.createOrder,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      message.success('Đặt hàng thành công')
      // Extract the data from the Axios response
      setOrderResponse(response.data)
      setCurrentStep(2)
      setIsSubmitting(false)
    },
    onError: (error) => {
      message.error('Đặt hàng thất bại. Vui lòng thử lại')
      setIsSubmitting(false)
    }
  })

  // Get checkout data from location state
  useEffect(() => {
    const data = location.state as CheckoutState

    if (!data || !data.cartItems || data.cartItems.length === 0) {
      message.error('Vui lòng chọn sản phẩm để mua hàng')
      navigate('/cart')
      return
    }

    setCheckoutData(data)
  }, [location.state, navigate])

  // If checkout data is not loaded yet, show loading
  if (!checkoutData) {
    return <div className='container mx-auto py-10 text-center'>Đang tải...</div>
  }

  const { shopItems, cartItems, shops } = checkoutData

  // Calculate totals
  const calculateTotal = () => {
    let total = 0
    let savings = 0

    cartItems.forEach((item) => {
      total += item.sku.price * item.quantity
      const originalPrice = item.sku.product.basePrice * item.quantity
      savings += originalPrice - item.sku.price * item.quantity
    })

    return { total, savings }
  }

  const { total, savings } = calculateTotal()

  // Handle form submission
  const handleSubmit = () => {
    if (!receiverInfo) {
      message.error('Thông tin người nhận không hợp lệ')
      return
    }

    setIsSubmitting(true)

    // Create orders for each shop
    const orders: CheckoutItem[] = shops.map((shop) => ({
      shopId: shop.id,
      cartItemIds: shopItems[shop.id],
      receiver: receiverInfo
    }))

    // Submit orders as an array
    createOrderMutation.mutate(orders)
  }

  // Handle continue to payment
  const handleContinue = () => {
    console.log('Continue button clicked')
    form
      .validateFields()
      .then((values) => {
        console.log('Form validation successful:', values)
        // Store the form values for later use
        setReceiverInfo(values as Receiver)
        setCurrentStep(1)
      })
      .catch((errorInfo) => {
        console.log('Form validation failed:', errorInfo)
        message.error('Vui lòng điền đầy đủ thông tin người nhận')
      })
  }

  // Handle back to cart
  const handleBackToCart = () => {
    navigate('/cart')
  }

  // Handle back to information
  const handleBackToInfo = () => {
    setCurrentStep(0)
  }

  // Handle continue shopping after order
  const handleContinueShopping = () => {
    navigate('/')
  }

  // Find shop name by ID
  const getShopNameById = (shopId: number) => {
    const shop = shops.find((s) => s.id === shopId)
    return shop ? shop.name : `Shop #${shopId}`
  }

  // Get cart items for a specific order
  const getCartItemsForOrder = (order: any) => {
    if (!checkoutData) return []

    // Get the cart item IDs for this shop from our checkout data
    const orderCartItemIds = checkoutData.shopItems[order.shopId] || []

    // Find the matching cart items
    return checkoutData.cartItems.filter((item) => orderCartItemIds.includes(item.id))
  }

  // Calculate total for a specific order
  const calculateOrderTotal = (cartItems: CartItemWithSKU[]) => {
    let total = 0
    let savings = 0

    cartItems.forEach((item) => {
      total += item.sku.price * item.quantity
      const originalPrice = item.sku.product.basePrice * item.quantity
      savings += originalPrice - item.sku.price * item.quantity
    })

    return { total, savings }
  }

  return (
    <div className='min-h-screen bg-gray-50 py-10'>
      <div className='container mx-auto px-4'>
        <Card className='mb-6'>
          <Steps
            current={currentStep}
            items={[
              {
                title: 'Thông tin đặt hàng',
                icon: <UserOutlined />
              },
              {
                title: 'Xác nhận đơn hàng',
                icon: <ShoppingCartOutlined />
              },
              {
                title: 'Hoàn tất',
                icon: <CheckCircleOutlined />
              }
            ]}
          />
        </Card>

        {currentStep === 0 && (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <div className='md:col-span-2'>
              <Card title='Thông tin người nhận' className='mb-6'>
                <Form
                  form={form}
                  layout='vertical'
                  initialValues={
                    receiverInfo || {
                      name: '',
                      phone: '',
                      address: ''
                    }
                  }
                >
                  <Form.Item
                    name='name'
                    label='Họ và tên'
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                  >
                    <Input placeholder='Nhập họ và tên người nhận' prefix={<UserOutlined />} />
                  </Form.Item>

                  <Form.Item
                    name='phone'
                    label='Số điện thoại'
                    rules={[
                      { required: true, message: 'Vui lòng nhập số điện thoại' },
                      { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
                    ]}
                  >
                    <Input placeholder='Nhập số điện thoại' />
                  </Form.Item>

                  <Form.Item
                    name='address'
                    label='Địa chỉ'
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                  >
                    <Input.TextArea placeholder='Nhập địa chỉ giao hàng' rows={3} />
                  </Form.Item>
                </Form>
              </Card>
            </div>

            <div className='md:col-span-1'>
              <Card title='Tóm tắt đơn hàng' className='mb-6'>
                <div className='space-y-4'>
                  <div className='flex justify-between'>
                    <span>Tổng tiền hàng:</span>
                    <span>₫{formatCurrency(total + savings)}</span>
                  </div>

                  <div className='flex justify-between text-red-500'>
                    <span>Giảm giá:</span>
                    <span>-₫{formatCurrency(savings)}</span>
                  </div>

                  <Divider className='my-2' />

                  <div className='flex justify-between text-lg font-bold'>
                    <span>Tổng thanh toán:</span>
                    <span className='text-red-500'>₫{formatCurrency(total)}</span>
                  </div>

                  <div className='text-right text-xs text-gray-500'>(Đã bao gồm VAT nếu có)</div>
                </div>
              </Card>

              <div className='mt-4 flex justify-between'>
                <Button onClick={handleBackToCart}>Quay lại giỏ hàng</Button>
                <Button type='primary' onClick={handleContinue} size='middle' className='bg-blue-500 hover:bg-blue-600'>
                  Tiếp tục
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && receiverInfo && (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            <div className='md:col-span-2'>
              <Card title='Xác nhận đơn hàng' className='mb-6'>
                {shops.map((shop) => (
                  <div key={shop.id} className='mb-6'>
                    <div className='mb-4 flex items-center gap-2 rounded bg-gray-50 p-3'>
                      <Avatar src={shop.avatar} />
                      <span className='font-semibold'>{shop.name}</span>
                    </div>

                    {cartItems
                      .filter((item) => shopItems[shop.id].includes(item.id))
                      .map((item) => (
                        <div key={item.id} className='mb-4 flex items-center gap-4 border-b p-3'>
                          <div className='h-16 w-16 flex-shrink-0'>
                            <img
                              src={item.sku.image || item.sku.product.images[0]}
                              alt={item.sku.product.name}
                              className='h-full w-full object-cover'
                            />
                          </div>

                          <div className='flex-grow'>
                            <div className='font-medium'>{item.sku.product.name}</div>
                            <div className='text-sm text-gray-500'>Phân loại: {item.sku.value}</div>
                            <div className='text-sm'>x{item.quantity}</div>
                          </div>

                          <div className='text-right'>
                            <div className='text-red-500'>₫{formatCurrency(item.sku.price)}</div>
                            <div className='text-xs text-gray-500 line-through'>
                              ₫{formatCurrency(item.sku.product.basePrice)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </Card>

              <Card title='Thông tin người nhận' className='mb-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <div className='mb-1 text-gray-500'>Họ và tên:</div>
                    <div className='font-medium'>{receiverInfo.name}</div>
                  </div>

                  <div>
                    <div className='mb-1 text-gray-500'>Số điện thoại:</div>
                    <div className='font-medium'>{receiverInfo.phone}</div>
                  </div>

                  <div className='md:col-span-2'>
                    <div className='mb-1 text-gray-500'>Địa chỉ:</div>
                    <div className='font-medium'>{receiverInfo.address}</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className='md:col-span-1'>
              <Card title='Tóm tắt đơn hàng' className='mb-6'>
                <div className='space-y-4'>
                  <div className='flex justify-between'>
                    <span>Tổng tiền hàng:</span>
                    <span>₫{formatCurrency(total + savings)}</span>
                  </div>

                  <div className='flex justify-between text-red-500'>
                    <span>Giảm giá:</span>
                    <span>-₫{formatCurrency(savings)}</span>
                  </div>

                  <Divider className='my-2' />

                  <div className='flex justify-between text-lg font-bold'>
                    <span>Tổng thanh toán:</span>
                    <span className='text-red-500'>₫{formatCurrency(total)}</span>
                  </div>

                  <div className='text-right text-xs text-gray-500'>(Đã bao gồm VAT nếu có)</div>
                </div>
              </Card>

              <div className='flex justify-between'>
                <Button onClick={handleBackToInfo}>Quay lại</Button>

                <Button
                  type='primary'
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className='bg-blue-500 hover:bg-blue-600'
                >
                  Đặt hàng
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && orderResponse && (
          <Card className='py-10 text-center'>
            <CheckCircleOutlined className='mb-4 text-6xl text-green-500' />
            <h2 className='mb-2 text-2xl font-bold'>Đặt hàng thành công!</h2>

            <div className='mx-auto mb-6 max-w-3xl text-left'>
              {/* Payment Information */}
              <div className='mb-4 rounded-lg bg-gray-50 p-4'>
                <h3 className='mb-2 font-semibold'>Thông tin thanh toán:</h3>
                <p>
                  <span className='text-gray-500'>Mã thanh toán:</span> #{orderResponse.paymentId}
                </p>
                <p>
                  <span className='text-gray-500'>Tổng đơn hàng:</span> {orderResponse.orders.length} đơn
                </p>
                <p>
                  <span className='text-gray-500'>Tổng tiền cần thanh toán: </span>₫{formatCurrency(total)}
                </p>
              </div>

              {/* Order Information */}
              <Collapse defaultActiveKey={['0']} className='mb-4'>
                {orderResponse.orders.map((order, index) => {
                  // Get cart items for this order
                  const orderCartItems = getCartItemsForOrder(order)
                  const { total: orderTotal, savings: orderSavings } = calculateOrderTotal(orderCartItems)

                  return (
                    <Panel
                      header={
                        <div className='flex items-center justify-between'>
                          <span>
                            Đơn hàng #{order.id} - {getShopNameById(order.shopId)}
                          </span>
                          <span className='text-orange-500 font-medium'>
                            {order.status === 'PENDING_PAYMENT' ? 'Chờ thanh toán' : order.status}
                          </span>
                        </div>
                      }
                      key={index}
                    >
                      <div className='p-2'>
                        {/* Order Items */}
                        <div className='mb-4'>
                          <h4 className='mb-2 font-medium'>Sản phẩm đã mua:</h4>
                          <List
                            itemLayout='horizontal'
                            dataSource={orderCartItems}
                            renderItem={(item) => (
                              <List.Item>
                                <div className='flex w-full items-center'>
                                  <div className='mr-4 h-16 w-16 flex-shrink-0'>
                                    <img
                                      src={item.sku.image || item.sku.product.images[0]}
                                      alt={item.sku.product.name}
                                      className='h-full w-full rounded object-cover'
                                    />
                                  </div>
                                  <div className='flex-grow'>
                                    <div className='font-medium'>{item.sku.product.name}</div>
                                    <div className='text-sm text-gray-500'>Phân loại: {item.sku.value}</div>
                                    <div className='text-sm'>x{item.quantity}</div>
                                  </div>
                                  <div className='text-right'>
                                    <div className='text-red-500'>₫{formatCurrency(item.sku.price)}</div>
                                    <div className='text-xs text-gray-500 line-through'>
                                      ₫{formatCurrency(item.sku.product.basePrice)}
                                    </div>
                                  </div>
                                </div>
                              </List.Item>
                            )}
                          />
                        </div>

                        {/* Order Total */}
                        <div className='mb-4 rounded bg-gray-50 p-3'>
                          <div className='mb-1 flex justify-between'>
                            <span>Tổng tiền hàng:</span>
                            <span>₫{formatCurrency(orderTotal + orderSavings)}</span>
                          </div>
                          <div className='mb-1 flex justify-between text-red-500'>
                            <span>Giảm giá:</span>
                            <span>-₫{formatCurrency(orderSavings)}</span>
                          </div>
                          <div className='flex justify-between font-medium'>
                            <span>Tổng thanh toán:</span>
                            <span className='text-red-500'>₫{formatCurrency(orderTotal)}</span>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className='mb-3'>
                          <div className='mb-1 text-gray-500'>Thông tin người nhận:</div>
                          <p className='mb-1'>
                            <span className='font-medium'>{order.receiver.name}</span> | {order.receiver.phone}
                          </p>
                          <p className='text-gray-700'>{order.receiver.address}</p>
                        </div>

                        <div className='mb-3'>
                          <div className='mb-1 text-gray-500'>Thời gian đặt hàng:</div>
                          <p>{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                      </div>
                    </Panel>
                  )
                })}
              </Collapse>

              {/* Receiver Information */}
              <div className='rounded-lg bg-gray-50 p-4'>
                <h3 className='mb-2 font-semibold'>Thông tin người nhận:</h3>
                <p>
                  <span className='text-gray-500'>Họ tên:</span> {orderResponse.orders[0].receiver.name}
                </p>
                <p>
                  <span className='text-gray-500'>Số điện thoại:</span> {orderResponse.orders[0].receiver.phone}
                </p>
                <p>
                  <span className='text-gray-500'>Địa chỉ:</span> {orderResponse.orders[0].receiver.address}
                </p>
              </div>
            </div>

            <p className='mb-6 text-gray-500'>Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.</p>

            <div className='flex justify-center gap-4'>
              <Button
                type='primary'
                size='large'
                onClick={handleContinueShopping}
                className='bg-blue-500 hover:bg-blue-600'
              >
                Tiếp tục mua sắm
              </Button>

              {/* You can add a button to view order details here */}
              <Button size='large'>Xem chi tiết đơn hàng</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
