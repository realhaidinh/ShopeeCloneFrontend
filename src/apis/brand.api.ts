import { Brand, BrandListResponse } from 'src/types/brand.type'
import http from 'src/utils/http'

const URL = 'brands'
const brandApi = {
  getBrands: (params?: { page: number; limit: number }) => {
    return http.get<BrandListResponse>(URL, { params })
  },
  getDetailBrand: (id: number) => {
    return http.get<Brand>(`${URL}/${id}`)
  }
}
export default brandApi
