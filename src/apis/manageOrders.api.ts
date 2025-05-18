import { ListOrdersResponse } from 'src/types/purchase.type'
import http from 'src/utils/http'

const URL = 'orders'
export const manageOrderApi = {
  getListOrders(params: { page: number; limit: number }) {
    return http.get<ListOrdersResponse>(`${URL}/manage`, { params })
  }
}
