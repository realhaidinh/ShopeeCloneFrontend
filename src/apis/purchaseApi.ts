import { CartItem, CartResponse, CheckoutItem, OrderResponse } from 'src/types/purchase.type'
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
  createOrder(body: CheckoutItem) {
    return http.post<OrderResponse>('orders', body)
  },
  deleteCart(body: { cartItemIds: number[] }) {
    return http.post<{ message: string }>(`${URL}/delete`, body)
  }
}

export default purchaseApi
