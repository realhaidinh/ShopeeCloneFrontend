'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Button,
  Descriptions,
  Tag,
  List,
  Divider,
  Steps,
  message,
  Modal,
  Spin,
  Result,
  Timeline,
  Tabs,
  Typography,
  Alert
} from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ShoppingOutlined,
  CheckCircleOutlined,
  CarOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ClockCircleOutlined,
  DollarCircleOutlined,
  ShoppingCartOutlined,
  CopyOutlined,
  CreditCardOutlined,
  LoadingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import purchaseApi from 'src/apis/purchaseApi'
import { formatCurrency } from 'src/utils/utils'
import io, { type Socket } from 'socket.io-client'
import { getAccessTokenFromLS } from 'src/utils/auth'

const { confirm } = Modal
const { Step } = Steps
const { TabPane } = Tabs
const { Title, Text, Paragraph } = Typography

interface PaymentStatus {
  status: string
  message?: string
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const orderId = Number(id)
  const [activeTab, setActiveTab] = useState('1')
  const [qrLoading, setQrLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  // Fetch order details
  const {
    data: orderData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => purchaseApi.getDetailOrder(orderId),
    enabled: !isNaN(orderId)
  })

  // Get the order from the response data
  const order = orderData?.data

  // Fetch all orders with the same payment ID
  const { data: relatedOrdersData, isLoading: isLoadingRelatedOrders } = useQuery({
    queryKey: ['relatedOrders', order?.paymentId],
    queryFn: () => purchaseApi.getListOrders({ page: 1, limit: 100 }),
    enabled: !!order?.paymentId
  })

  // Filter orders with the same payment ID
  const relatedOrders =
    relatedOrdersData?.data?.data?.filter(
      (relatedOrder) => relatedOrder.paymentId === order?.paymentId && relatedOrder.id !== order?.id
    ) || []

  // Calculate total for all orders with the same payment ID
  const calculateTotalForAllOrders = () => {
    let total = calculateTotal()

    // Add totals from related orders
    relatedOrders.forEach((relatedOrder) => {
      const orderTotal = relatedOrder.items.reduce((sum, item) => sum + item.skuPrice * item.quantity, 0)
      total += orderTotal
    })

    return total
  }

  // Cancel single order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: number) => purchaseApi.cancelOrder(orderId),
    onSuccess: () => {
      message.success('Đã hủy đơn hàng thành công')
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })

      // Switch back to the "Chi tiết đơn hàng" tab
      setActiveTab('1')

      setIsCancelling(false)
    },
    onError: (error) => {
      message.error('Không thể hủy đơn hàng. Vui lòng thử lại sau.')
      console.error('Error canceling order:', error)
      setIsCancelling(false)
    }
  })

  // Cancel all related orders mutation
  const cancelAllRelatedOrdersMutation = useMutation({
    mutationFn: async (orderIds: number[]) => {
      setIsCancelling(true)
      const promises = orderIds.map((id) => purchaseApi.cancelOrder(id))
      return Promise.all(promises)
    },
    onSuccess: () => {
      message.success('Đã hủy tất cả đơn hàng thành công')
      queryClient.invalidateQueries({ queryKey: ['order'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['relatedOrders', order?.paymentId] })
      setIsCancelling(false)

      // Switch back to the "Chi tiết đơn hàng" tab
      setActiveTab('1')

      // Don't navigate away from the page
      // navigate("/orders") - REMOVED
    },
    onError: (error) => {
      message.error('Không thể hủy tất cả đơn hàng. Vui lòng thử lại sau.')
      console.error('Error canceling all orders:', error)
      setIsCancelling(false)
    }
  })

  // Connect to WebSocket server when entering payment tab for PENDING_PAYMENT orders
  useEffect(() => {
    if (order && order.status === 'PENDING_PAYMENT' && activeTab === '3') {
      connectToWebSocket(order.paymentId)
    }

    // Cleanup WebSocket connection when leaving payment tab or component unmounts
    return () => {
      if (socketRef.current) {
        console.log('Closing WebSocket connection')
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [activeTab, order])

  // Connect to WebSocket server
  const connectToWebSocket = (paymentId: number) => {
    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    setIsConnecting(true)
    const accessToken = getAccessTokenFromLS()
    console.log('Connecting to WebSocket with token:', accessToken ? 'Token exists' : 'No token')

    // Create new connection with auth token
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      extraHeaders: {
        authorization: `bearer ${accessToken}`
      }
    })

    socket.on('connect', () => {
      console.log('WebSocket connected with ID:', socket.id)
      setIsConnecting(false)

      // Join payment room
      socket.emit('join', { paymentId: paymentId })
      console.log('Joined payment room for ID:', paymentId)
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      message.error(`Không thể kết nối đến máy chủ: ${error.message}`)
      setIsConnecting(false)
    })

    socket.on('payment', (data: PaymentStatus) => {
      console.log('Payment event received:', data)

      if (data.status === 'success') {
        // Update payment status
        setPaymentStatus({
          status: 'success',
          message: 'Thanh toán thành công!'
        })

        // Show success message
        message.success('Thanh toán thành công!')

        // Switch to the "Chi tiết đơn hàng" tab
        setActiveTab('1')

        // Refresh all orders with this payment ID
        queryClient.invalidateQueries({ queryKey: ['order'] })
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        queryClient.invalidateQueries({ queryKey: ['relatedOrders', order?.paymentId] })
      }
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    socket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })

    // Store socket reference
    socketRef.current = socket
  }

  // Handle cancel order
  const showCancelConfirm = () => {
    if (!order) return

    // If there are related orders, show a different confirmation dialog
    if (relatedOrders.length > 0) {
      confirm({
        title: 'Hủy tất cả đơn hàng liên quan?',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>Bạn đang hủy nhóm đơn hàng có cùng mã thanh toán #{order.paymentId}.</p>
            <p>Tất cả {relatedOrders.length + 1} đơn hàng sau sẽ bị hủy:</p>
            <ul className='mt-2'>
              <li>- Đơn hàng hiện tại #{order.id}</li>
              {relatedOrders.map((relatedOrder) => (
                <li key={relatedOrder.id}>- Đơn hàng #{relatedOrder.id}</li>
              ))}
            </ul>
            <p className='mt-2 text-red-500'>Lưu ý: Hành động này không thể hoàn tác.</p>
          </div>
        ),
        okText: 'Hủy tất cả đơn hàng',
        okType: 'danger',
        cancelText: 'Không',
        onOk() {
          // Get all order IDs including the current one
          const allOrderIds = [order.id, ...relatedOrders.map((o) => o.id)]
          cancelAllRelatedOrdersMutation.mutate(allOrderIds)
        }
      })
    } else {
      // If there are no related orders, show the regular confirmation dialog
      confirm({
        title: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
        icon: <ExclamationCircleOutlined />,
        content: 'Đơn hàng sẽ bị hủy và không thể khôi phục.',
        okText: 'Hủy đơn hàng',
        okType: 'danger',
        cancelText: 'Không',
        onOk() {
          setIsCancelling(true)
          cancelOrderMutation.mutate(orderId)
        }
      })
    }
  }

  // Calculate total price for current order
  const calculateTotal = () => {
    if (!order?.items) return 0
    return order.items.reduce((total, item) => total + item.skuPrice * item.quantity, 0)
  }

  // Generate QR code URL
  const generateQrCodeUrl = (paymentId: number, amount: number) => {
    // Ensure amount has no decimal places for the QR code
    const formattedAmount = Math.round(amount).toString()

    return `https://qr.sepay.vn/img?acc=${import.meta.env.VITE_BANK_ACCOUNT}&bank=${
      import.meta.env.VITE_BANK_NAME
    }&amount=${formattedAmount}&des=${import.meta.env.VITE_PAYMENT_PREFIX}${paymentId}`
  }

  // Copy payment ID to clipboard
  const copyPaymentId = () => {
    if (order) {
      navigator.clipboard.writeText(`${import.meta.env.VITE_PAYMENT_PREFIX}${order.paymentId}`)
      message.success('Đã sao chép mã thanh toán')
    }
  }

  // Get current step based on order status
  const getCurrentStep = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 1
      case 'PENDING_PICKUP':
        return 2
      case 'PENDING_DELIVERY':
        return 3
      case 'DELIVERED':
        return 4
      case 'CANCELLED':
        return -1
      case 'RETURNED':
        return -1
      default:
        return 1
    }
  }

  // Get status tag color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'orange'
      case 'PENDING_PICKUP':
        return 'blue'
      case 'PENDING_DELIVERY':
        return 'yellow'
      case 'RETURNED':
        return 'cyan'
      case 'DELIVERED':
        return 'green'
      case 'CANCELLED':
        return 'red'
      default:
        return 'default'
    }
  }

  // Get status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'Chờ thanh toán'
      case 'PENDING_PICKUP':
        return 'Chờ lấy hàng'
      case 'PENDING_DELIVERY':
        return 'Đang giao hàng'
      case 'DELIVERED':
        return 'Đã giao hàng'
      case 'CANCELLED':
        return 'Đã hủy'
      case 'RETURNED':
        return 'Hoàn trả'
      default:
        return status
    }
  }

  // Handle back to orders list
  const handleBackToOrders = () => {
    navigate('/orders')
  }

  // Handle payment for pending payment orders
  const handlePayNow = () => {
    setActiveTab('3') // Switch to payment tab
  }

  // View related order
  const handleViewRelatedOrder = (relatedOrderId: number) => {
    navigate(`/orders/${relatedOrderId}`)
  }

  // Get order timeline events
  const getOrderTimeline = () => {
    if (!order) return []

    const events = [
      {
        time: new Date(order.createdAt).toLocaleString('vi-VN'),
        title: 'Đơn hàng đã được tạo',
        description: `Đơn hàng #${order.id} đã được tạo thành công.`,
        dot: <ClockCircleOutlined style={{ fontSize: '16px' }} />,
        color: 'blue'
      }
    ]

    // Add status-specific events
    switch (order.status) {
      case 'PENDING_PAYMENT':
        events.push({
          time: new Date(order.createdAt).toLocaleString('vi-VN'),
          title: 'Chờ thanh toán',
          description: 'Đơn hàng đang chờ thanh toán.',
          dot: <DollarCircleOutlined style={{ fontSize: '16px' }} />,
          color: 'orange'
        })
        break
      case 'PENDING_PICKUP':
        events.push({
          time: new Date(order.updatedAt).toLocaleString('vi-VN'),
          title: 'Đã thanh toán',
          description: 'Đơn hàng đã được thanh toán thành công.',
          dot: <DollarCircleOutlined style={{ fontSize: '16px' }} />,
          color: 'green'
        })
        events.push({
          time: new Date(order.updatedAt).toLocaleString('vi-VN'),
          title: 'Chờ lấy hàng',
          description: 'Đơn hàng đang chờ được lấy hàng.',
          dot: <ShoppingCartOutlined style={{ fontSize: '16px' }} />,
          color: 'blue'
        })
        break
      case 'PENDING_DELIVERY':
        events.push({
          time: new Date(order.updatedAt).toLocaleString('vi-VN'),
          title: 'Đã thanh toán',
          description: 'Đơn hàng đã được thanh toán thành công.',
          dot: <DollarCircleOutlined style={{ fontSize: '16px' }} />,
          color: 'green'
        })
        events.push({
          time: new Date(order.updatedAt).toLocaleString('vi-VN'),
          title: 'Đã lấy hàng',
          description: 'Đơn hàng đã được lấy hàng.',
          dot: <ShoppingCartOutlined style={{ fontSize: '16px' }} />,
          color: 'green'
        })
        events.push({
          time: new Date(order.updatedAt).toLocaleString('vi-VN'),
          title: 'Đang giao hàng',
          description: 'Đơn hàng đang được giao đến địa chỉ của bạn.',
          dot: <CarOutlined style={{ fontSize: '16px' }} />,
          color: 'yellow'
        })
        break
      case 'DELIVERED':
        events.push({
          time: new Date(order.updatedAt).toLocaleString('vi-VN'),
          title: 'Đã thanh toán',
          description: 'Đơn hàng đã được thanh toán thành công.',
          dot: <DollarCircleOutlined style={{ fontSize: '16px' }} />,
          color: 'green'
        })
        events.push({
          time: new Date(order.updatedAt).toLocaleString('vi-VN'),
          title: 'Đã lấy hàng',
          description: 'Đơn hàng đã được lấy hàng.',
          dot: <ShoppingCartOutlined style={{ fontSize: '16px' }} />,
          color: 'green'
        })
        events.push({
          time: new Date(order.updatedAt).toLocaleString('vi-VN'),
          title: 'Đã giao hàng',
          description: 'Đơn hàng đã được giao thành công.',
          dot: <CheckCircleOutlined style={{ fontSize: '16px' }} />,
          color: 'green'
        })
        break
      case 'CANCELLED':
        events.push({
          time: new Date(order.updatedAt).toLocaleString('vi-VN'),
          title: 'Đã hủy',
          description: 'Đơn hàng đã bị hủy.',
          dot: <ExclamationCircleOutlined style={{ fontSize: '16px' }} />,
          color: 'red'
        })
        break
      case 'RETURNED':
        events.push({
          time: new Date(order.updatedAt).toLocaleString('vi-VN'),
          title: 'Đã hoàn trả',
          description: 'Đơn hàng đã được hoàn trả.',
          dot: <ExclamationCircleOutlined style={{ fontSize: '16px' }} />,
          color: 'cyan'
        })
        break
    }

    return events
  }

  // Get steps based on order status
  const getOrderSteps = () => {
    if (!order) return []

    switch (order.status) {
      case 'PENDING_PAYMENT':
        return [
          {
            title: 'Đặt hàng',
            description: 'Đơn hàng đã được đặt',
            icon: <ShoppingOutlined />
          },
          {
            title: 'Chờ thanh toán',
            description: 'Đơn hàng đang chờ thanh toán',
            icon: <DollarCircleOutlined />
          },
          {
            title: 'Chờ lấy hàng',
            description: 'Đơn hàng chờ được lấy hàng',
            icon: <ShoppingCartOutlined />
          },
          {
            title: 'Vận chuyển',
            description: 'Đơn hàng đang được giao',
            icon: <CarOutlined />
          },
          {
            title: 'Hoàn thành',
            description: 'Đơn hàng đã giao thành công',
            icon: <CheckCircleOutlined />
          }
        ]
      case 'PENDING_PICKUP':
        return [
          {
            title: 'Đặt hàng',
            description: 'Đơn hàng đã được đặt',
            icon: <ShoppingOutlined />
          },
          {
            title: 'Thanh toán',
            description: 'Đơn hàng đã thanh toán',
            icon: <DollarCircleOutlined />
          },
          {
            title: 'Chờ lấy hàng',
            description: 'Đơn hàng chờ được lấy hàng',
            icon: <ShoppingCartOutlined />
          },
          {
            title: 'Vận chuyển',
            description: 'Đơn hàng đang được giao',
            icon: <CarOutlined />
          },
          {
            title: 'Hoàn thành',
            description: 'Đơn hàng đã giao thành công',
            icon: <CheckCircleOutlined />
          }
        ]
      case 'PENDING_DELIVERY':
        return [
          {
            title: 'Đặt hàng',
            description: 'Đơn hàng đã được đặt',
            icon: <ShoppingOutlined />
          },
          {
            title: 'Thanh toán',
            description: 'Đơn hàng đã thanh toán',
            icon: <DollarCircleOutlined />
          },
          {
            title: 'Lấy hàng',
            description: 'Đơn hàng đã được lấy hàng',
            icon: <ShoppingCartOutlined />
          },
          {
            title: 'Vận chuyển',
            description: 'Đơn hàng đang được giao',
            icon: <CarOutlined />
          },
          {
            title: 'Hoàn thành',
            description: 'Đơn hàng đã giao thành công',
            icon: <CheckCircleOutlined />
          }
        ]
      case 'DELIVERED':
        return [
          {
            title: 'Đặt hàng',
            description: 'Đơn hàng đã được đặt',
            icon: <ShoppingOutlined />
          },
          {
            title: 'Thanh toán',
            description: 'Đơn hàng đã thanh toán',
            icon: <DollarCircleOutlined />
          },
          {
            title: 'Lấy hàng',
            description: 'Đơn hàng đã được lấy hàng',
            icon: <ShoppingCartOutlined />
          },
          {
            title: 'Vận chuyển',
            description: 'Đơn hàng đang được giao',
            icon: <CarOutlined />
          },
          {
            title: 'Hoàn thành',
            description: 'Đơn hàng đã giao thành công',
            icon: <CheckCircleOutlined />
          }
        ]
      default:
        return [
          {
            title: 'Đặt hàng',
            description: 'Đơn hàng đã được đặt',
            icon: <ShoppingOutlined />
          },
          {
            title: 'Thanh toán',
            description: 'Đơn hàng đã thanh toán',
            icon: <DollarCircleOutlined />
          },
          {
            title: 'Lấy hàng',
            description: 'Đơn hàng đã được lấy hàng',
            icon: <ShoppingCartOutlined />
          },
          {
            title: 'Vận chuyển',
            description: 'Đơn hàng đang được giao',
            icon: <CarOutlined />
          },
          {
            title: 'Hoàn thành',
            description: 'Đơn hàng đã giao thành công',
            icon: <CheckCircleOutlined />
          }
        ]
    }
  }

  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-center py-16'>
          <Spin size='large' tip='Đang tải thông tin đơn hàng...' />
        </div>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <Result
          status='error'
          title='Không thể tải thông tin đơn hàng'
          subTitle='Đã xảy ra lỗi khi tải thông tin đơn hàng. Vui lòng thử lại sau.'
          extra={[
            <Button type='primary' key='back' onClick={handleBackToOrders}>
              Quay lại danh sách đơn hàng
            </Button>,
            <Button key='retry' onClick={() => refetch()}>
              Thử lại
            </Button>
          ]}
        />
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center'>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBackToOrders}>
            Quay lại danh sách đơn hàng
          </Button>
          <h1 className='ml-4 text-xl font-bold'>Chi tiết đơn hàng #{order.id}</h1>
        </div>
        <Tag color={getStatusColor(order.status)} className='px-3 py-1 text-base'>
          {getStatusText(order.status)}
        </Tag>
      </div>

      {order.status === 'CANCELLED' || order.status === 'RETURNED' ? (
        <Card className='mb-6'>
          <Result
            status='error'
            title={order.status === 'CANCELLED' ? 'Đơn hàng đã bị hủy' : 'Đơn hàng đã hoàn trả'}
            subTitle={`Đơn hàng #${order.id} ${
              order.status === 'CANCELLED' ? 'đã bị hủy' : 'đã được hoàn trả'
            } vào ${new Date(order.updatedAt).toLocaleString('vi-VN')}`}
          />
        </Card>
      ) : (
        <Card className='mb-6'>
          <Steps current={getCurrentStep(order.status)} className='mb-8' items={getOrderSteps()} />

          {order.status === 'PENDING_PAYMENT' && (
            <div className='bg-orange-50 border-orange-200 mt-4 rounded-lg border p-4'>
              <div className='flex items-center'>
                <ExclamationCircleOutlined className='text-orange-500 mr-2 text-xl' />
                <div>
                  <p className='text-orange-700 font-medium'>Đơn hàng chưa được thanh toán</p>
                  <p className='text-orange-600'>Vui lòng thanh toán để đơn hàng được xử lý.</p>
                </div>
                <Button
                  type='primary'
                  className='bg-orange-500 hover:bg-orange-600 ml-auto border-none'
                  onClick={handlePayNow}
                >
                  Thanh toán ngay
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <div className='md:col-span-2'>
          <Tabs activeKey={activeTab} onChange={setActiveTab} className='mb-6'>
            <TabPane tab='Chi tiết đơn hàng' key='1'>
              <Card title='Thông tin đơn hàng' className='mb-6'>
                <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                  <Descriptions.Item label='Mã đơn hàng'>#{order.id}</Descriptions.Item>
                  <Descriptions.Item label='Ngày đặt hàng'>
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </Descriptions.Item>
                  <Descriptions.Item label='Trạng thái'>
                    <Tag color={getStatusColor(order.status)}>{getStatusText(order.status)}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label='Mã thanh toán'>#{order.paymentId}</Descriptions.Item>
                </Descriptions>

                {relatedOrders.length > 0 && (
                  <Alert
                    message='Thông tin thanh toán chung'
                    description={
                      <div>
                        <p>
                          Đơn hàng này thuộc nhóm {relatedOrders.length + 1} đơn hàng có cùng mã thanh toán #
                          {order.paymentId}. Khi thanh toán hoặc hủy, tất cả đơn hàng trong nhóm sẽ được xử lý cùng lúc.
                        </p>
                        <div className='mt-2'>
                          <Text strong>Các đơn hàng liên quan:</Text>
                          <ul className='mt-1'>
                            {relatedOrders.map((relatedOrder) => (
                              <li key={relatedOrder.id} className='mb-1'>
                                <Button
                                  type='link'
                                  onClick={() => handleViewRelatedOrder(relatedOrder.id)}
                                  className='p-0'
                                >
                                  Đơn hàng #{relatedOrder.id}
                                </Button>
                                {' - '}
                                <Tag color={getStatusColor(relatedOrder.status)}>
                                  {getStatusText(relatedOrder.status)}
                                </Tag>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    }
                    type='info'
                    showIcon
                    icon={<InfoCircleOutlined />}
                    className='mt-4'
                  />
                )}
              </Card>

              <Card title='Sản phẩm đã mua' className='mb-6'>
                <List
                  itemLayout='horizontal'
                  dataSource={order.items || []}
                  renderItem={(item) => (
                    <List.Item>
                      <div className='flex w-full items-center'>
                        <div className='mr-4 h-16 w-16 flex-shrink-0'>
                          <img
                            src={item.image || '/placeholder.svg'}
                            alt={item.productName}
                            className='h-full w-full rounded object-cover'
                          />
                        </div>
                        <div className='flex-grow'>
                          <div className='font-medium'>{item.productName}</div>
                          <div className='text-sm text-gray-500'>Phân loại: {item.skuValue}</div>
                          <div className='text-sm'>x{item.quantity}</div>
                        </div>
                        <div className='text-right'>
                          <div className='text-red-500'>₫{formatCurrency(item.skuPrice)}</div>
                          <div className='text-xs text-gray-500'>₫{formatCurrency(item.skuPrice * item.quantity)}</div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />

                <Divider />

                <div className='flex justify-end'>
                  <div className='w-64 space-y-2'>
                    <div className='flex justify-between'>
                      <span>Tổng tiền hàng:</span>
                      <span>₫{formatCurrency(calculateTotal())}</span>
                    </div>
                    <div className='flex justify-between text-lg font-bold'>
                      <span>Tổng thanh toán:</span>
                      <span className='text-red-500'>₫{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </TabPane>

            <TabPane tab='Lịch sử đơn hàng' key='2'>
              <Card className='mb-6'>
                <Timeline
                  mode='left'
                  items={getOrderTimeline().map((event) => ({
                    color: event.color,
                    dot: event.dot,
                    children: (
                      <div>
                        <div className='flex justify-between'>
                          <Text strong>{event.title}</Text>
                          <Text type='secondary'>{event.time}</Text>
                        </div>
                        <div>{event.description}</div>
                      </div>
                    )
                  }))}
                />
              </Card>
            </TabPane>

            {order.status === 'PENDING_PAYMENT' && (
              <TabPane tab='Thanh toán' key='3'>
                <Card className='py-6'>
                  {paymentStatus && paymentStatus.status === 'success' ? (
                    <Result
                      status='success'
                      title='Thanh toán thành công!'
                      subTitle='Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đang được xử lý và sẽ được giao trong thời gian sớm nhất.'
                      extra={[
                        <Button
                          type='primary'
                          key='orders'
                          onClick={handleBackToOrders}
                          className='bg-blue-500 hover:bg-blue-600'
                        >
                          Xem danh sách đơn hàng
                        </Button>
                      ]}
                    />
                  ) : (
                    <>
                      <div className='mb-6 text-center'>
                        <CreditCardOutlined className='mb-4 text-5xl text-blue-500' />
                        <h2 className='mb-2 text-2xl font-bold'>Thanh toán đơn hàng</h2>
                        <p className='text-gray-500'>Quét mã QR bên dưới để thanh toán đơn hàng của bạn</p>
                        {isConnecting && (
                          <div className='mt-2 flex items-center justify-center text-blue-500'>
                            <LoadingOutlined className='mr-2' />
                            <span>Đang kết nối đến máy chủ thanh toán...</span>
                          </div>
                        )}
                      </div>

                      {relatedOrders.length > 0 && (
                        <Alert
                          message='Thanh toán cho nhiều đơn hàng'
                          description={
                            <div>
                              <p>
                                Bạn đang thanh toán cho nhóm {relatedOrders.length + 1} đơn hàng có cùng mã thanh toán #
                                {order.paymentId}. Khi thanh toán, tất cả đơn hàng trong nhóm sẽ được xử lý cùng lúc.
                              </p>
                              <div className='mt-2'>
                                <Text strong>Các đơn hàng trong nhóm:</Text>
                                <ul className='mt-1'>
                                  <li className='mb-1'>
                                    <Text strong>Đơn hàng hiện tại #{order.id}:</Text> ₫
                                    {formatCurrency(calculateTotal())}
                                  </li>
                                  {relatedOrders.map((relatedOrder) => {
                                    const orderTotal = relatedOrder.items.reduce(
                                      (sum, item) => sum + item.skuPrice * item.quantity,
                                      0
                                    )
                                    return (
                                      <li key={relatedOrder.id} className='mb-1'>
                                        <Button
                                          type='link'
                                          onClick={() => handleViewRelatedOrder(relatedOrder.id)}
                                          className='p-0'
                                        >
                                          Đơn hàng #{relatedOrder.id}
                                        </Button>
                                        : ₫{formatCurrency(orderTotal)}
                                      </li>
                                    )
                                  })}
                                </ul>
                                <div className='mt-2 font-medium'>
                                  Tổng thanh toán cho tất cả đơn hàng:{' '}
                                  <span className='text-red-500'>₫{formatCurrency(calculateTotalForAllOrders())}</span>
                                </div>
                              </div>
                            </div>
                          }
                          type='warning'
                          showIcon
                          className='mb-6'
                        />
                      )}

                      <div className='mx-auto max-w-3xl'>
                        <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                          <div>
                            <Card title='Thông tin thanh toán' className='mb-4'>
                              <div className='space-y-4'>
                                <div className='flex items-center justify-between'>
                                  <span className='text-gray-500'>Mã thanh toán:</span>
                                  <div className='flex items-center'>
                                    <span className='mr-2 font-medium'>#{order.paymentId}</span>
                                    <Button
                                      type='text'
                                      icon={<CopyOutlined />}
                                      size='small'
                                      onClick={copyPaymentId}
                                      className='text-blue-500'
                                    />
                                  </div>
                                </div>

                                <div className='flex justify-between'>
                                  <span className='text-gray-500'>Tổng tiền hàng:</span>
                                  <span>
                                    {relatedOrders.length > 0
                                      ? `₫${formatCurrency(calculateTotalForAllOrders())}`
                                      : `₫${formatCurrency(calculateTotal())}`}
                                  </span>
                                </div>

                                <Divider className='my-2' />

                                <div className='flex justify-between text-lg font-bold'>
                                  <span>Tổng thanh toán:</span>
                                  <span className='text-red-500'>
                                    {relatedOrders.length > 0
                                      ? `₫${formatCurrency(calculateTotalForAllOrders())}`
                                      : `₫${formatCurrency(calculateTotal())}`}
                                  </span>
                                </div>
                              </div>
                            </Card>

                            <Card title='Hướng dẫn thanh toán' className='mb-4'>
                              <div className='space-y-4'>
                                <div>
                                  <h4 className='mb-1 font-medium'>1. Mở ứng dụng ngân hàng</h4>
                                  <p className='text-sm text-gray-500'>
                                    Mở ứng dụng ngân hàng của bạn và chọn chức năng quét mã QR
                                  </p>
                                </div>

                                <div>
                                  <h4 className='mb-1 font-medium'>2. Quét mã QR</h4>
                                  <p className='text-sm text-gray-500'>Quét mã QR hiển thị bên cạnh</p>
                                </div>

                                <div>
                                  <h4 className='mb-1 font-medium'>3. Kiểm tra thông tin</h4>
                                  <p className='text-sm text-gray-500'>
                                    Kiểm tra thông tin người nhận và số tiền thanh toán
                                  </p>
                                </div>

                                <div>
                                  <h4 className='mb-1 font-medium'>4. Nhập nội dung chuyển khoản</h4>
                                  <p className='text-sm text-gray-500'>
                                    Nhập nội dung chuyển khoản:{' '}
                                    <span className='font-medium'>
                                      {import.meta.env.VITE_PAYMENT_PREFIX}
                                      {order.paymentId}
                                    </span>
                                  </p>
                                </div>

                                <div>
                                  <h4 className='mb-1 font-medium'>5. Xác nhận thanh toán</h4>
                                  <p className='text-sm text-gray-500'>Xác nhận và hoàn tất giao dịch</p>
                                </div>
                              </div>
                            </Card>
                          </div>

                          <div className='flex flex-col items-center'>
                            <div className='mb-4 w-full max-w-xs rounded-lg bg-white p-4 shadow-md'>
                              {qrLoading ? (
                                <div className='mx-auto flex h-64 w-64 items-center justify-center'>
                                  <Spin tip='Đang tải mã QR...' />
                                </div>
                              ) : (
                                <img
                                  src={
                                    generateQrCodeUrl(
                                      order.paymentId,
                                      relatedOrders.length > 0 ? calculateTotalForAllOrders() : calculateTotal()
                                    ) || '/placeholder.svg'
                                  }
                                  alt='Mã QR thanh toán'
                                  className='mx-auto h-64 w-64'
                                  onLoad={() => setQrLoading(false)}
                                  onError={() => {
                                    setQrLoading(false)
                                    message.error('Không thể tải mã QR. Vui lòng thử lại sau.')
                                  }}
                                />
                              )}
                            </div>

                            <p className='mb-6 text-center text-sm text-gray-500'>
                              Quét mã QR để thanh toán số tiền{' '}
                              <span className='font-medium text-red-500'>
                                {relatedOrders.length > 0
                                  ? `₫${formatCurrency(calculateTotalForAllOrders())}`
                                  : `₫${formatCurrency(calculateTotal())}`}
                              </span>
                            </p>

                            <div className='w-full rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
                              <p className='text-sm text-yellow-800'>
                                <span className='font-medium'>Lưu ý:</span> Vui lòng không đóng trang này cho đến khi
                                bạn hoàn tất thanh toán. Đơn hàng của bạn sẽ được xử lý sau khi chúng tôi nhận được
                                thanh toán.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              </TabPane>
            )}
          </Tabs>
        </div>

        <div className='md:col-span-1'>
          <Card title='Thông tin người nhận' className='mb-6'>
            <div className='space-y-4'>
              <div className='flex items-center'>
                <UserOutlined className='mr-2 text-gray-500' />
                <div>
                  <div className='text-gray-500'>Họ tên:</div>
                  <div className='font-medium'>{order.receiver.name}</div>
                </div>
              </div>
              <div className='flex items-center'>
                <PhoneOutlined className='mr-2 text-gray-500' />
                <div>
                  <div className='text-gray-500'>Số điện thoại:</div>
                  <div className='font-medium'>{order.receiver.phone}</div>
                </div>
              </div>
              <div className='flex items-start'>
                <EnvironmentOutlined className='mr-2 mt-1 text-gray-500' />
                <div>
                  <div className='text-gray-500'>Địa chỉ:</div>
                  <div className='font-medium'>{order.receiver.address}</div>
                </div>
              </div>
            </div>
          </Card>

          <Card title='Thao tác' className='mb-6'>
            {order.status === 'PENDING_PAYMENT' && (
              <>
                <Button
                  type='primary'
                  icon={<DollarCircleOutlined />}
                  onClick={handlePayNow}
                  block
                  className='mb-2 bg-blue-500 hover:bg-blue-600'
                  disabled={isCancelling}
                >
                  Thanh toán ngay
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={showCancelConfirm}
                  block
                  className='mb-2'
                  loading={isCancelling}
                  disabled={isCancelling}
                >
                  {relatedOrders.length > 0 ? 'Hủy tất cả đơn hàng' : 'Hủy đơn hàng'}
                </Button>
                {relatedOrders.length > 0 && (
                  <div className='mt-2 text-xs text-red-500'>
                    * Lưu ý: Thao tác này sẽ hủy tất cả {relatedOrders.length + 1} đơn hàng có cùng mã thanh toán.
                  </div>
                )}
              </>
            )}

            <Button icon={<ArrowLeftOutlined />} onClick={handleBackToOrders} block disabled={isCancelling}>
              Quay lại danh sách đơn hàng
            </Button>

            {order.status === 'PENDING_PAYMENT' && (
              <p className='mt-2 text-xs text-gray-500'>
                * Bạn chỉ có thể hủy đơn hàng khi đơn hàng chưa được thanh toán.
              </p>
            )}
          </Card>

          <Card title='Hỗ trợ' className='mb-6'>
            <p className='mb-4 text-gray-600'>Bạn cần hỗ trợ về đơn hàng này?</p>
            <Button type='primary' block className='bg-green-500 hover:bg-green-600'>
              Liên hệ hỗ trợ
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
