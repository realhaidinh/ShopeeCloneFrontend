export interface CartResponse {
  data: ShopCart[]
  totalItems: number
  page: number
  limit: number
  totalPages: number
}

export interface ShopCart {
  shop: Shop
  cartItems: CartItemWithSKU[]
}

export interface Shop {
  id: number
  name: string
  avatar: string
}

export interface CartItemWithSKU {
  id: number
  quantity: number
  skuId: number
  userId: number
  createdAt: string
  updatedAt: string
  sku: SKU
}

export interface SKU {
  id: number
  value: string
  price: number
  stock: number
  image: string
  productId: number
  product: Product
}

export interface Product {
  id: number
  publishedAt: string
  name: string
  basePrice: number
  virtualPrice: number
  brandId: number
  images: string[]
  variants: Variant[]
  productTranslations: ProductTranslation[]
}

export interface Variant {
  value: string
  options: string[]
}

export interface ProductTranslation {
  id: number
  productId: number
  name: string
  description: string
  languageId: string
}

export interface CartItem {
  id: number
  quantity: number
  skuId: number
  userId: number
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
}

export interface Receiver {
  name: string
  phone: string
  address: string
}

export interface CheckoutItem {
  shopId: number
  cartItemIds: number[]
  receiver: Receiver
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
}

export interface OrderResponse {
  orders: Order[]
  paymentId: number
}
