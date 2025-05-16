import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, message } from 'antd'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import purchaseApi from 'src/apis/purchaseApi'
import { formatCurrency, generateNameId } from 'src/utils/utils'
import { CreditCardOutlined, TruckOutlined, WechatOutlined } from '@ant-design/icons'
import CustomQuantityController from 'src/components/CustomQuantityController'

export default function Cart() {
  const queryClient = useQueryClient()
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [loadingItems, setLoadingItems] = useState<number[]>([])

  // Query to get cart items
  const { data: purchasesInCartData, isLoading: isCartLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn: () => purchaseApi.getCart()
  })

  const purchasesInCart = purchasesInCartData?.data.data || []

  // Mutations
  const updateCartMutation = useMutation({
    mutationFn: purchaseApi.updateCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      message.success('Cập nhật giỏ hàng thành công')
    },
    onError: () => {
      message.error('Cập nhật giỏ hàng thất bại')
    }
  })

  const deleteCartMutation = useMutation({
    mutationFn: purchaseApi.deleteCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      message.success('Xóa sản phẩm thành công')
      // Clear selected items that were deleted
      setSelectedItems((prev) => prev.filter((id) => !loadingItems.includes(id)))
      setLoadingItems([])
    },
    onError: () => {
      message.error('Xóa sản phẩm thất bại')
      setLoadingItems([])
    }
  })

  // Check if all items are selected
  const isAllSelected =
    purchasesInCart.length > 0 &&
    purchasesInCart.every((shop) => shop.cartItems.every((item) => selectedItems.includes(item.id)))

  // Check if a shop's items are all selected
  const isShopSelected = (shopId: number) => {
    const shop = purchasesInCart.find((s) => s.shop.id === shopId)
    if (!shop) return false
    return shop.cartItems.every((item) => selectedItems.includes(item.id))
  }

  // Get all cart item IDs
  const getAllCartItemIds = () => {
    return purchasesInCart.flatMap((shop) => shop.cartItems.map((item) => item.id))
  }

  // Get all cart item IDs for a specific shop
  const getShopCartItemIds = (shopId: number) => {
    const shop = purchasesInCart.find((s) => s.shop.id === shopId)
    if (!shop) return []
    return shop.cartItems.map((item) => item.id)
  }

  // Handle select all
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([])
    } else {
      setSelectedItems(getAllCartItemIds())
    }
  }

  // Handle select shop
  const handleSelectShop = (shopId: number) => {
    const shopItemIds = getShopCartItemIds(shopId)

    if (isShopSelected(shopId)) {
      // If all shop items are selected, unselect them
      setSelectedItems((prev) => prev.filter((id) => !shopItemIds.includes(id)))
    } else {
      // If not all shop items are selected, select all of them
      setSelectedItems((prev) => {
        const filteredIds = prev.filter((id) => !shopItemIds.includes(id))
        return [...filteredIds, ...shopItemIds]
      })
    }
  }

  // Handle select individual item
  const handleSelectItem = (itemId: number) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId))
    } else {
      setSelectedItems((prev) => [...prev, itemId])
    }
  }

  // Handle update quantity

  // Handle update quantity
  const handleUpdateQuantity = (cartItem: any, newQuantity: number) => {
    // Don't update if quantity is the same
    if (newQuantity === cartItem.quantity) return

    // Double-check validation against stock (defensive programming)
    if (cartItem.sku.stock !== undefined && newQuantity > cartItem.sku.stock) {
      message.error(`${cartItem.sku.product.name}: Số lượng không thể vượt quá ${cartItem.sku.stock}`)
      return
    }

    // Add item to loading state
    setLoadingItems((prev) => [...prev, cartItem.id])

    updateCartMutation.mutate(
      {
        cartItemId: cartItem.id,
        skuId: cartItem.skuId,
        quantity: newQuantity
      },
      {
        onSettled: () => {
          // Remove item from loading state
          setLoadingItems((prev) => prev.filter((id) => id !== cartItem.id))
        }
      }
    )
  }

  // Handle delete item
  const handleDeleteItem = (cartItemId: number) => {
    // Add item to loading state
    setLoadingItems((prev) => [...prev, cartItemId])

    deleteCartMutation.mutate({
      cartItemIds: [cartItemId]
    })
  }

  // Handle delete selected items
  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      message.info('Vui lòng chọn sản phẩm để xóa')
      return
    }

    // Add selected items to loading state
    setLoadingItems((prev) => [...prev, ...selectedItems])

    deleteCartMutation.mutate({
      cartItemIds: selectedItems
    })
  }

  // Calculate total price of selected items
  const calculateTotal = () => {
    let total = 0
    let savings = 0

    purchasesInCart.forEach((shop) => {
      shop.cartItems.forEach((item) => {
        if (selectedItems.includes(item.id)) {
          total += item.sku.price * item.quantity
          const originalPrice = item.sku.product.basePrice * item.quantity
          savings += originalPrice - item.sku.price * item.quantity
        }
      })
    })

    return { total, savings }
  }

  const { total, savings } = calculateTotal()

  // Count selected items
  const selectedItemsCount = selectedItems.length

  return (
    <div className='bg-neutral-100 py-16'>
      <div className='container'>
        <div className='overflow-auto'>
          <div className='min-w-[1000px]'>
            {/* Header */}
            <div className='grid grid-cols-12 rounded-sm bg-white py-5 px-9 text-sm capitalize text-gray-500 shadow'>
              <div className='col-span-6'>
                <div className='flex items-center'>
                  <div className='flex-grow pl-3 '>Sản phẩm</div>
                </div>
              </div>
              <div className='col-span-6'>
                <div className='grid grid-cols-5 text-center'>
                  <div className='col-span-2'>Đơn giá</div>
                  <div className='col-span-1'>Số lượng</div>
                  <div className='col-span-1'>Số tiền</div>
                  <div className='col-span-1'>Thao tác</div>
                </div>
              </div>
            </div>

            {/* Danh sách shop và cart items */}
            {purchasesInCart?.map((item) => (
              <div key={item.shop.id}>
                {/* Tên shop */}
                <div className='mt-5 flex items-center gap-5 rounded-sm bg-white px-9 py-3 shadow'>
                  <input
                    type='checkbox'
                    className='h-5 w-5 accent-orange'
                    checked={isShopSelected(item.shop.id)}
                    onChange={() => handleSelectShop(item.shop.id)}
                    disabled={isCartLoading || item.cartItems.some((cartItem) => loadingItems.includes(cartItem.id))}
                  />
                  <div className='rounded-sm bg-orange py-1 px-2 text-sm text-white'>
                    <span>Yêu thích</span>
                  </div>
                  <Link to={`/shop/${item.shop.id}`}>{item.shop.name}</Link>
                  <WechatOutlined style={{ color: '#ff6633', fontSize: '1.3rem' }} />
                </div>
                <div className='h-[1px] bg-gray-200'></div>

                {/* Cart Items */}
                <div className='rounded-sm bg-white p-5 shadow'>
                  {item.cartItems.map((cartItem) => {
                    const isItemLoading = loadingItems.includes(cartItem.id)

                    return (
                      <div
                        key={cartItem.id}
                        className={`mb-5 grid grid-cols-12 rounded-sm border border-gray-200 bg-white py-5 px-4 text-center text-sm text-gray-500 first:mt-0 ${
                          isItemLoading ? 'pointer-events-none opacity-50' : ''
                        }`}
                      >
                        <div className='col-span-6'>
                          <div className='flex'>
                            <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                              <input
                                type='checkbox'
                                className='h-5 w-5 accent-orange'
                                checked={selectedItems.includes(cartItem.id)}
                                onChange={() => handleSelectItem(cartItem.id)}
                                disabled={isItemLoading || isCartLoading}
                              />
                            </div>
                            <div className='flex-grow'>
                              <div className='flex'>
                                <Link
                                  className='h-20 w-20 flex-shrink-0'
                                  to={`/products/${generateNameId({
                                    name: cartItem.sku.product.name,
                                    id: cartItem.sku.product.id.toString()
                                  })}`}
                                >
                                  <img
                                    alt={cartItem.sku.product.name}
                                    src={cartItem.sku.image || cartItem.sku.product.images[0]}
                                    className='h-full w-full object-cover'
                                  />
                                </Link>
                                <div className='flex-grow px-2 pt-1 pb-2 text-left'>
                                  <Link
                                    to={`/products/${generateNameId({
                                      name: cartItem.sku.product.name,
                                      id: cartItem.sku.product.id.toString()
                                    })}`}
                                    className='font-medium text-black line-clamp-2'
                                  >
                                    {cartItem.sku.product.name}
                                  </Link>
                                  <div className='mt-1 text-xs text-gray-400'>{cartItem.sku.value}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className='col-span-6'>
                          <div className='grid grid-cols-5 items-center'>
                            <div className='col-span-2'>
                              <div className='flex items-center justify-center'>
                                <span className='text-gray-300 line-through'>
                                  ₫{formatCurrency(cartItem.sku.product.basePrice)}
                                </span>
                                <span className='ml-3'>₫{formatCurrency(cartItem.sku.price)}</span>
                              </div>
                            </div>
                            <div className='col-span-1'>
                              <CustomQuantityController
                                max={cartItem.sku.stock || 0}
                                value={cartItem.quantity}
                                disabled={isItemLoading}
                                onType={(value) => handleUpdateQuantity(cartItem, value)}
                                classNameWrapper='flex items-center justify-center'
                                productName={cartItem.sku.product.name}
                              />
                            </div>
                            <div className='col-span-1'>
                              <span className='text-orange'>
                                ₫{formatCurrency(cartItem.sku.price * cartItem.quantity)}
                              </span>
                            </div>
                            <div className='col-span-1'>
                              <button
                                className='bg-none text-black transition-colors hover:text-orange'
                                onClick={() => handleDeleteItem(cartItem.id)}
                                disabled={isItemLoading}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {/* Giảm giá và vận chuyển */}
                <div className='h-[1px] bg-gray-200'></div>
                <div className='flex items-center gap-5 rounded-sm bg-white px-9 py-4 shadow'>
                  <CreditCardOutlined style={{ color: '#ff6633', fontSize: '1.3rem' }} />
                  <span className='text-sm'>Voucher giảm sâu</span>
                </div>
                <div className='h-[1px] bg-gray-200'></div>
                <div className='flex items-center gap-5 rounded-sm bg-white px-9 py-4 shadow'>
                  <TruckOutlined style={{ color: '#ff6633', fontSize: '1.3rem' }} />
                  <span className='text-sm'>Miễn phí vận chuyển khi thanh toán online</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className='sticky bottom-0 z-10 mt-8 flex flex-col rounded-sm border border-orange bg-white p-5 shadow sm:flex-row sm:items-center'>
          <div className='flex items-center'>
            <div className='flex flex-shrink-0 items-center justify-center pr-3'>
              <input
                type='checkbox'
                className='h-5 w-5 accent-orange'
                checked={isAllSelected && purchasesInCart.length > 0}
                onChange={handleSelectAll}
                disabled={isCartLoading || loadingItems.length > 0}
              />
            </div>
            <button
              className='mx-3 border-none bg-none'
              onClick={handleSelectAll}
              disabled={isCartLoading || loadingItems.length > 0}
            >
              Chọn tất cả
            </button>
            <button
              className='mx-3 border-none bg-none'
              onClick={handleDeleteSelected}
              disabled={selectedItems.length === 0 || isCartLoading || loadingItems.length > 0}
            >
              Xóa
            </button>
          </div>

          <div className='mt-5 flex flex-col sm:ml-auto sm:mt-0 sm:flex-row sm:items-center'>
            <div>
              <div className='flex items-center sm:justify-end'>
                <div>Tổng thanh toán ({selectedItemsCount} sản phẩm):</div>
                <div className='ml-2 text-2xl text-orange'>₫{formatCurrency(total)}</div>
              </div>
              <div className='flex items-center text-sm sm:justify-end'>
                <div className='text-gray-500'>Tiết kiệm</div>
                <div className='ml-6 text-orange'>₫{formatCurrency(savings)}</div>
              </div>
            </div>
            <Button
              className='mt-5 flex h-10 w-52 items-center justify-center bg-red-500 text-sm uppercase text-white hover:bg-red-600 sm:ml-4 sm:mt-0'
              disabled={selectedItemsCount === 0 || isCartLoading || loadingItems.length > 0}
            >
              Mua hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
