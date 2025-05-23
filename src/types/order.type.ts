export const OrderStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PENDING_PICKUP: 'PENDING_PICKUP',
  PENDING_DELIVERY: 'PENDING_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED'
}

export interface Receiver {
  name: string
  phone: string
  address: string
}

export interface Order {
  id: number
  userId: number
  status: string
  receiver: Receiver
  shopId: number
  paymentId: number
  createdById: number
  updatedById: number | null
  deletedById: number | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  items?: ListOrderItem[]
}

export interface OrderResponse {
  orders: Order[]
  paymentId: number
}

export interface ListOrdersResponse {
  data: ListOrder[]
  totalItems: number
  page: number
  limit: number
  totalPages: number
}

export interface ListOrder {
  id: number
  userId: number
  status: string
  shopId: number
  paymentId: number
  createdAt: string
  updatedAt: string
  items: ListOrderItem[]
}

export interface ListOrderItem {
  id: number
  productId: number
  productName: string
  productTranslations: ProductTranslation[]
  skuPrice: number
  image: string
  skuValue: string
  skuId: number
  orderId: number
  quantity: number
  createdAt: string
}

export interface ProductTranslation {
  id: number
  productId: number
  name: string
  description: string
  languageId: string
  createdById: number
  updatedById: number | null
  deletedById: number | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ChangeOrderStatusReqBody {
  status: typeof OrderStatus[keyof typeof OrderStatus]
}
