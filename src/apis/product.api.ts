import { Product, ProductList, ProductListConfig } from 'src/types/product.type'
import { NotFoundApi } from 'src/types/utils.type'
import http from 'src/utils/http'

const URL = 'products'
const productApi = {
  getProducts: (params: ProductListConfig) => {
    return http.get<ProductList>(URL, {
      params
    })
  },
  getProductDetail(id: string) {
    return http.get<Product | NotFoundApi>(`${URL}/${id}`)
  }
}

export default productApi
