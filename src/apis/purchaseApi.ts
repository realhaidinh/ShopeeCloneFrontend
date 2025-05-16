import { CartItem, CartResponse, CheckoutItem, ListOrdersResponse, Order, OrderResponse } from 'src/types/purchase.type'
import http from 'src/utils/http'

const URL = 'cart'

export const purchaseApi = {
  addToCart(body: { skuId: number; quantity: number }) {
    return http.post<CartItem>(`${URL}`, body)
  },
  getCart() {
    return http.get<CartResponse>(`${URL}`)
  },
  updateCart(body: { cartItemId: number; skuId: number; quantity: number }) {
    return http.put<CartItem>(`${URL}/${body.cartItemId}`, {
      skuId: body.skuId,
      quantity: body.quantity
    })
  },
  createOrder(body: CheckoutItem[]) {
    return http.post<OrderResponse>('orders', body)
  },
  deleteCart(body: { cartItemIds: number[] }) {
    return http.post<{ message: string }>(`${URL}/delete`, body)
  },
  getListOrders(params: { page: number; limit: number }) {
    return http.get<ListOrdersResponse>('orders', { params })
  },
  getDetailOrder(id: number) {
    return http.get<Order>(`orders/${id}`)
  },
  cancelOrder(id: number) {
    return http.put<Order>(`orders/${id}`)
  }
}

export default purchaseApi
