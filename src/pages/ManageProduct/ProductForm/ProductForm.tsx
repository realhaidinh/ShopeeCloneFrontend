'use client'

import { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  Input,
  Button,
  Upload,
  message,
  DatePicker,
  Select,
  InputNumber,
  Divider,
  Card,
  Table,
  Row,
  Col,
  Tabs,
  Image,
  Spin
} from 'antd'
import { PlusOutlined, MinusCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  Product,
  CreateProductReqBody,
  UpdateProductReqBody,
  Variant,
  Sku,
  Category,
  Brand
} from 'src/types/product.type'
import dayjs from 'dayjs'
import { generateSKUs } from 'src/utils/product'
import { manageProductApi } from 'src/apis/manageProduct.api'

const { TabPane } = Tabs

interface ProductFormProps {
  visible: boolean
  product: Product | null
  isEditing: boolean
  onClose: () => void
  onSuccess: () => void
  categoryApi: any
  brandApi: any
}

export default function ProductForm({
  visible,
  product,
  isEditing,
  onClose,
  onSuccess,
  categoryApi,
  brandApi
}: ProductFormProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const [productImages, setProductImages] = useState<string[]>([])
  const [uploadingProductImage, setUploadingProductImage] = useState(false)
  const [variants, setVariants] = useState<Variant[]>([])
  const [skus, setSkus] = useState<Partial<Sku>[]>([])
  const [skuImages, setSkuImages] = useState<Record<string, string>>({})
  const [uploadingSkuImage, setUploadingSkuImage] = useState<Record<string, boolean>>({})
  // Don't use React Query for categories to avoid duplicate calls
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  // Fetch all categories once when the modal becomes visible
  useEffect(() => {
    const fetchAllCategories = async () => {
      if (!visible) return

      setLoadingCategories(true)
      setCategoriesError(null)

      try {
        console.log('Fetching parent categories...')
        // First fetch parent categories
        const parentResponse = await categoryApi.getParentCategories()
        console.log('Parent categories response:', parentResponse)

        if (!parentResponse || !parentResponse.data.data) {
          throw new Error('Failed to fetch parent categories')
        }

        const parentCategories = parentResponse.data.data
        console.log(`Found ${parentCategories.length} parent categories`)

        let allCats = [...parentCategories]

        // For each parent category, fetch its children
        for (const parent of parentCategories) {
          try {
            console.log(`Fetching children for parent ${parent.id} (${parent.name})`)
            const childrenResponse = await categoryApi.getChildrenCategories(parent.id)
            console.log(`Children for parent ${parent.id}:`, childrenResponse)

            if (childrenResponse && childrenResponse.data.data) {
              console.log(`Found ${childrenResponse.data.length} children for parent ${parent.id}`)
              allCats = [...allCats, ...childrenResponse.data.data]
            }
          } catch (childError) {
            console.error(`Error fetching children for parent ${parent.id}:`, childError)
            // Continue with other parents even if one fails
          }
        }

        console.log(`Total categories fetched: ${allCats.length}`)
        setAllCategories(allCats)
      } catch (error) {
        console.error('Error in fetchAllCategories:', error)
        setCategoriesError('Failed to load categories. Please try again.')
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchAllCategories()
  }, [visible, categoryApi]) // Only depend on visible and categoryApi

  // Fetch brands
  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandApi.getBrands(),
    enabled: visible
  })

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (data: CreateProductReqBody) => manageProductApi.create(data),
    onSuccess: () => {
      message.success('Product created successfully')
      queryClient.invalidateQueries(['products'])
      form.resetFields()
      setProductImages([])
      setVariants([])
      setSkus([])
      setSkuImages({})
      onSuccess()
    },
    onError: (error) => {
      message.error('Failed to create product')
      console.error(error)
    }
  })

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductReqBody }) => manageProductApi.update(id, data),
    onSuccess: () => {
      message.success('Product updated successfully')
      queryClient.invalidateQueries(['products'])
      queryClient.invalidateQueries(['product', product?.id])
      onSuccess()
    },
    onError: (error) => {
      message.error('Failed to update product')
      console.error(error)
    }
  })

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (visible) {
      if (isEditing && product) {
        // Extract category IDs consistently
        const categoryIds = Array.isArray(product.categories)
          ? product.categories.map((cat) => {
              // Handle both object format and direct ID format
              if (typeof cat === 'object' && cat !== null) {
                return cat.id
              }
              return cat
            })
          : []

        form.setFieldsValue({
          name: product.name,
          basePrice: product.basePrice,
          virtualPrice: product.virtualPrice,
          brandId: product.brandId,
          categories: categoryIds,
          publishedAt: product.publishedAt ? dayjs(product.publishedAt) : null
        })

        setProductImages(product.images || [])
        setVariants(product.variants || [])
        setSkus(product.skus || [])

        // Set SKU images
        const skuImagesMap: Record<string, string> = {}
        product.skus?.forEach((sku) => {
          if (sku.image) {
            skuImagesMap[sku.value] = sku.image
          }
        })
        setSkuImages(skuImagesMap)
      } else {
        form.resetFields()
        setProductImages([])
        setVariants([])
        setSkus([])
        setSkuImages({})
      }
    }
  }, [visible, product, isEditing, form])

  // Handle product image upload
  const handleProductImageUpload = async (info: any) => {
    if (info.file.status === 'uploading') {
      return
    }

    if (info.file.originFileObj) {
      try {
        setUploadingProductImage(true)
        const files = [info.file.originFileObj]
        const response = await manageProductApi.uploadImages(files)

        if (response.data && response.data.data.length > 0) {
          const imageUrl = response.data.data[0].url
          setProductImages((prev) => [...prev, imageUrl])
          message.success('Image uploaded successfully')
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        message.error('Failed to upload image')
      } finally {
        setUploadingProductImage(false)
      }
    }
  }

  // Handle SKU image upload
  const handleSkuImageUpload = async (info: any, skuValue: string) => {
    if (info.file.status === 'uploading') {
      return
    }

    if (info.file.originFileObj) {
      try {
        setUploadingSkuImage((prev) => ({ ...prev, [skuValue]: true }))
        const files = [info.file.originFileObj]
        const response = await manageProductApi.uploadImages(files)

        if (response.data && response.data.data.length > 0) {
          const imageUrl = response.data.data[0].url
          setSkuImages((prev) => ({ ...prev, [skuValue]: imageUrl }))

          // Update the SKU with the new image
          setSkus((prev) => prev.map((sku) => (sku.value === skuValue ? { ...sku, image: imageUrl } : sku)))

          message.success('SKU image uploaded successfully')
        }
      } catch (error) {
        console.error('Error uploading SKU image:', error)
        message.error('Failed to upload SKU image')
      } finally {
        setUploadingSkuImage((prev) => ({ ...prev, [skuValue]: false }))
      }
    }
  }

  // Remove product image
  const removeProductImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Add variant
  const addVariant = () => {
    setVariants([...variants, { value: '', options: [''] }])
  }

  // Remove variant
  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  // Update variant
  const updateVariant = (index: number, field: keyof Variant, value: string | string[]) => {
    const newVariants = [...variants]
    if (field === 'value') {
      newVariants[index].value = value as string
    } else if (field === 'options') {
      newVariants[index].options = value as string[]
    }
    setVariants(newVariants)
  }

  // Add option to variant
  const addOption = (variantIndex: number) => {
    const newVariants = [...variants]
    newVariants[variantIndex].options.push('')
    setVariants(newVariants)
  }

  // Remove option from variant
  const removeOption = (variantIndex: number, optionIndex: number) => {
    const newVariants = [...variants]
    newVariants[variantIndex].options = newVariants[variantIndex].options.filter((_, i) => i !== optionIndex)
    setVariants(newVariants)
  }

  // Update option
  const updateOption = (variantIndex: number, optionIndex: number, value: string) => {
    const newVariants = [...variants]
    newVariants[variantIndex].options[optionIndex] = value
    setVariants(newVariants)
  }

  // Generate SKUs based on variants
  const handleGenerateSkus = () => {
    // Validate variants first
    const isValid = variants.every((variant) => variant.value && variant.options.every((opt) => opt))
    if (!isValid) {
      message.error('Please fill in all variant names and options before generating SKUs')
      return
    }

    // Generate SKUs
    const generatedSkus = generateSKUs(variants)

    // Preserve existing SKU data if updating
    if (isEditing && skus.length > 0) {
      const existingSkuMap: Record<string, Partial<Sku>> = {}
      skus.forEach((sku) => {
        if (sku.value) {
          existingSkuMap[sku.value] = sku
        }
      })

      const newSkus = generatedSkus.map((sku) => {
        if (existingSkuMap[sku.value]) {
          return {
            ...existingSkuMap[sku.value],
            value: sku.value
          }
        }
        return sku
      })

      setSkus(newSkus)
    } else {
      setSkus(generatedSkus)
    }

    message.success('SKUs generated successfully')
  }

  // Update SKU
  const updateSku = (index: number, field: keyof Sku, value: any) => {
    const newSkus = [...skus]
    newSkus[index][field] = value
    setSkus(newSkus)
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()

      // Validate variants and SKUs
      if (variants.length === 0) {
        message.error('Please add at least one variant')
        return
      }

      if (skus.length === 0) {
        message.error('Please generate SKUs')
        return
      }

      // Prepare data for submission
      const formData = {
        name: values.name,
        publishedAt: values.publishedAt ? values.publishedAt.toISOString() : new Date().toISOString(),
        basePrice: values.basePrice,
        virtualPrice: values.virtualPrice || 0,
        brandId: values.brandId,
        images: productImages,
        variants,
        categories: values.categories,
        skus: skus.map((sku) => ({
          ...(sku.id ? { id: sku.id } : {}),
          value: sku.value,
          price: sku.price || 0,
          stock: sku.stock || 0,
          image: skuImages[sku.value as string] || ''
        }))
      }

      if (isEditing && product) {
        // Update existing product
        console.log(formData)
        updateProductMutation.mutate({
          id: product.id,
          data: formData as UpdateProductReqBody
        })
      } else {
        // Create new product
        createProductMutation.mutate(formData as CreateProductReqBody)
      }
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  // SKU columns for the table
  const skuColumns = [
    {
      title: 'SKU',
      dataIndex: 'value',
      key: 'value',
      render: (value: string) => value
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number, record: Partial<Sku>, index: number) => (
        <InputNumber
          min={0}
          value={price}
          onChange={(value) => updateSku(index, 'price', value)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number, record: Partial<Sku>, index: number) => (
        <InputNumber
          min={0}
          value={stock}
          onChange={(value) => updateSku(index, 'stock', value)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (_: any, record: Partial<Sku>) => (
        <Upload
          name='skuImage'
          listType='picture-card'
          className='avatar-uploader'
          showUploadList={false}
          customRequest={({ file, onSuccess }) => {
            setTimeout(() => {
              onSuccess && onSuccess('ok')
            }, 0)
          }}
          onChange={(info) => handleSkuImageUpload(info, record.value as string)}
        >
          {skuImages[record.value as string] ? (
            <img
              src={skuImages[record.value as string] || '/placeholder-image.png'}
              alt='SKU'
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div>
              {uploadingSkuImage[record.value as string] ? <LoadingOutlined /> : <PlusOutlined />}
              <div style={{ marginTop: 8 }}>
                {uploadingSkuImage[record.value as string] ? 'Uploading...' : 'Upload'}
              </div>
            </div>
          )}
        </Upload>
      )
    }
  ]

  // Helper function to get category name with parent prefix if needed
  const getCategoryDisplayName = (category: Category) => {
    if (!category.parentCategoryId) {
      return category.name
    }

    const parentCategory = allCategories.find((cat) => cat.id === category.parentCategoryId)
    return parentCategory ? `${parentCategory.name} > ${category.name}` : category.name
  }

  return (
    <Modal
      title={isEditing ? 'Edit Product' : 'Create Product'}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key='cancel' onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key='submit'
          onClick={handleSubmit}
          loading={createProductMutation.isLoading || updateProductMutation.isLoading}
        >
          {isEditing ? 'Update' : 'Create'}
        </Button>
      ]}
      width={1000}
    >
      <Tabs defaultActiveKey='basic'>
        <TabPane tab='Basic Information' key='basic'>
          <Form form={form} layout='vertical'>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name='name'
                  label='Product Name'
                  rules={[{ required: true, message: 'Please enter product name' }]}
                >
                  <Input placeholder='Enter product name' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name='publishedAt' label='Published Date'>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name='basePrice'
                  label='Base Price'
                  rules={[{ required: true, message: 'Please enter base price' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder='Enter base price' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name='virtualPrice' label='Virtual Price'>
                  <InputNumber min={0} style={{ width: '100%' }} placeholder='Enter virtual price (optional)' />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name='brandId' label='Brand' rules={[{ required: true, message: 'Please select a brand' }]}>
                  <Select placeholder='Select brand'>
                    {brandsData?.data?.data
                      ? brandsData.data.data.map((brand: Brand) => (
                          <Select.Option key={brand.id} value={brand.id}>
                            {brand.name}
                          </Select.Option>
                        ))
                      : brandsData?.data?.map((brand: Brand) => (
                          <Select.Option key={brand.id} value={brand.id}>
                            {brand.name}
                          </Select.Option>
                        ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name='categories'
                  label='Categories'
                  rules={[{ required: true, message: 'Please select at least one category' }]}
                >
                  {loadingCategories ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px' }}>
                      <Spin size='small' /> <span style={{ marginLeft: 8 }}>Loading categories...</span>
                    </div>
                  ) : categoriesError ? (
                    <div>
                      <Select placeholder='No categories available' disabled />
                      <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>{categoriesError}</div>
                    </div>
                  ) : allCategories.length > 0 ? (
                    <Select mode='multiple' placeholder='Select categories' optionFilterProp='children' showSearch>
                      {allCategories.map((category: Category) => (
                        <Select.Option key={category.id} value={category.id}>
                          {category.name}
                        </Select.Option>
                      ))}
                    </Select>
                  ) : (
                    <div>
                      <Select placeholder='No categories available' disabled />
                      <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                        No categories found. Please check if categories exist in the system.
                      </div>
                    </div>
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation='left'>Product Images</Divider>
            <div style={{ marginBottom: 16 }}>
              <Upload
                name='productImage'
                listType='picture-card'
                showUploadList={false}
                customRequest={({ file, onSuccess }) => {
                  setTimeout(() => {
                    onSuccess && onSuccess('ok')
                  }, 0)
                }}
                onChange={handleProductImageUpload}
              >
                {uploadingProductImage ? (
                  <div>
                    <LoadingOutlined />
                    <div style={{ marginTop: 8 }}>Uploading...</div>
                  </div>
                ) : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
              {productImages.map((image, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <Image
                    src={image || '/placeholder-image.png'}
                    alt={`Product Image ${index + 1}`}
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <Button
                    type='text'
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => removeProductImage(index)}
                    style={{ position: 'absolute', top: 0, right: 0 }}
                  />
                </div>
              ))}
            </div>
          </Form>
        </TabPane>

        <TabPane tab='Variants & SKUs' key='variants'>
          <Divider orientation='left'>Variants</Divider>
          <div style={{ marginBottom: 16 }}>
            <Button onClick={addVariant} icon={<PlusOutlined />}>
              Add Variant
            </Button>
          </div>

          {variants.map((variant, variantIndex) => (
            <Card
              key={variantIndex}
              title={`Variant ${variantIndex + 1}`}
              extra={
                <Button danger onClick={() => removeVariant(variantIndex)} icon={<MinusCircleOutlined />}>
                  Remove
                </Button>
              }
              style={{ marginBottom: 16 }}
            >
              <Form layout='vertical'>
                <Form.Item label='Variant Name' required>
                  <Input
                    value={variant.value}
                    onChange={(e) => updateVariant(variantIndex, 'value', e.target.value)}
                    placeholder='e.g., Color, Size'
                  />
                </Form.Item>

                <Divider orientation='left'>Options</Divider>
                <div style={{ marginBottom: 16 }}>
                  <Button type='dashed' onClick={() => addOption(variantIndex)} icon={<PlusOutlined />}>
                    Add Option
                  </Button>
                </div>

                {variant.options.map((option, optionIndex) => (
                  <div key={optionIndex} style={{ display: 'flex', marginBottom: 8, gap: 8 }}>
                    <Input
                      value={option}
                      onChange={(e) => updateOption(variantIndex, optionIndex, e.target.value)}
                      placeholder='e.g., Red, Blue, Small, Large'
                    />
                    <Button
                      danger
                      onClick={() => removeOption(variantIndex, optionIndex)}
                      icon={<MinusCircleOutlined />}
                    />
                  </div>
                ))}
              </Form>
            </Card>
          ))}

          <Divider orientation='left'>SKUs</Divider>
          <div style={{ marginBottom: 16 }}>
            <Button onClick={handleGenerateSkus} disabled={variants.length === 0}>
              Generate SKUs
            </Button>
          </div>

          {skus.length > 0 ? (
            <Table dataSource={skus} columns={skuColumns} rowKey='value' pagination={false} />
          ) : (
            <div>No SKUs generated yet. Add variants and click Generate SKUs.</div>
          )}
        </TabPane>
      </Tabs>
    </Modal>
  )
}
