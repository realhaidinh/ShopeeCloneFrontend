import { ChangeOrderStatusReqBody, ListOrdersResponse, Order } from 'src/types/order.type'
import http from 'src/utils/http'

const URL = 'orders'
export const manageOrderApi = {
  getListOrders(params: { page: number; limit: number }) {
    return http.get<ListOrdersResponse>(`${URL}/manage`, { params })
  },
  getDetailOrder(id: number) {
    return http.get<Order>(`${URL}/${id}`)
  },
  cancelOrder(id: number) {
    return http.put<Order>(`${URL}/${id}`)
  },
  changeStatusOrder(id: number, body: ChangeOrderStatusReqBody) {
    return http.put<Order>(`${URL}/status/${id}`, body)
  }
}
