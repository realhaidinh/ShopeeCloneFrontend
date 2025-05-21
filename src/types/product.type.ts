import { OrderBy, SortBy } from 'src/constants/product'

export interface Variant {
  value: string
  options: string[]
}

export interface Sku {
  id: number
  value: string
  price: number
  stock: number
  image: string
  productId: number
  createdById: number
  updatedById: number | null
  deletedById: number | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CategoryTranslation {
  id: number
  categoryId: number
  languageId: string
  name: string
  description: string
  createdById: number
  updatedById: number | null
  deletedById: number | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  parentCategoryId: number
  name: string
  logo: string
  createdById: number
  updatedById: number | null
  deletedById: number | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  categoryTranslations: CategoryTranslation[]
}

export interface BrandTranslation {
  id: number
  brandId: number
  languageId: string
  name: string
  description: string
  createdById: number
  updatedById: number | null
  deletedById: number | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Brand {
  id: number
  name: string
  logo: string
  createdById: number
  updatedById: number | null
  deletedById: number | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  brandTranslations: BrandTranslation[]
}

export interface Order {
  id: number
  userId: number
  status: string
  receiver: OrderReceiver
  shopId: number
  paymentId: number
  createdById: number
  updatedById: number | null
  deletedById: number | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderReceiver {
  name: string
  phone: string
  address: string
}

export interface ProductSKUSnapshot {
  id: number
  productId: number
  quantity: number
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
  createdById: number
  updatedById: number | null
  deletedById: number | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  productTranslations: ProductTranslation[]
  skus: Sku[]
  categories: Category[]
  brand: Brand
  orders?: Order[]
  productSKUSnapshots?: ProductSKUSnapshot[]
}

export interface ProductList {
  data: Product[]
  totalItems: number
  page: number
  limit: number
  totalPages: number
}

export interface ProductListConfig {
  page?: number | string // default: 1
  limit?: number | string // default: 10
  name?: string
  brandIds?: string[]
  categories?: number[]
  minPrice?: number | string
  maxPrice?: number | string
  createdById?: number | string
  orderBy?: OrderBy // default: OrderBy.Desc
  sortBy?: SortBy // default: SortBy.CreatedAt
  lang?: string
}

export interface CreateProductReqBody {
  name: string
  publishedAt: string
  basePrice: number
  virtualPrice: number
  brandId: number
  images: string[]
  variants: Variant[]
  categories: number[]
  skus: {
    value: string
    price: number
    stock: number
    image: string
  }[]
}

export interface UpdateProductReqBody {
  name: string
  publishedAt: string
  basePrice: number
  virtualPrice: number
  brandId: number
  images: string[]
  variants: Variant[]
  categories: number[]
  skus: {
    id: number
    value: string
    price: number
    stock: number
    image: string
  }[]
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

export interface CreateProductTranslationReqBody {
  name: string
  description: string
  productId: number
  languageId: string
}

export interface UpdateProductTranslationReqBody {
  name: string
  description: string
  productId: number
  languageId: string
}
