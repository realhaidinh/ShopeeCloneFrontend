import { Brand, BrandListResponse } from 'src/types/brand.type'
import http from 'src/utils/http'

const URL = 'brands'
const brandApi = {
  getBrands: () => {
    return http.get<BrandListResponse>(URL)
  },
  getDetailBrand: (id: number) => {
    return http.get<Brand>(`${URL}/${id}`)
  }
}
export default brandApi
