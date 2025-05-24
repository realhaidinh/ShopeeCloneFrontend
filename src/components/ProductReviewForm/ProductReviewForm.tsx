/* eslint-disable jsx-a11y/media-has-caption */
import { useState, useEffect } from 'react'
import { Modal, Form, Input, Rate, Button, Upload, message, Image, Typography, Divider } from 'antd'
import { DeleteOutlined, PlusOutlined, StarOutlined } from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import reviewApi from 'src/apis/review.api'
import type { CreateReviewReqBody, UpdateReviewReqBody, CreateReviewResBody, ReviewMedia } from 'src/types/review.type'

const { TextArea } = Input
const { Text } = Typography

interface ProductReviewFormProps {
  visible: boolean
  onCancel: () => void
  productId: number
  orderId: number
  productName: string
  productImage: string
  existingReview?: CreateReviewResBody | null
  mode: 'create' | 'edit'
}

interface MediaFile {
  uid: string
  url: string
  type: 'IMAGE' | 'VIDEO'
  file?: File
}

export default function ProductReviewForm({
  visible,
  onCancel,
  productId,
  orderId,
  productName,
  productImage,
  existingReview,
  mode
}: ProductReviewFormProps) {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [uploading, setUploading] = useState(false)

  // Initialize form with existing review data
  useEffect(() => {
    if (existingReview && mode === 'edit') {
      form.setFieldsValue({
        content: existingReview.content,
        rating: existingReview.rating
      })

      // Set existing media files
      const existingMedia: MediaFile[] = existingReview.medias.map((media, index) => ({
        uid: `existing-${index}`,
        url: media.url,
        type: media.type as 'IMAGE' | 'VIDEO'
      }))
      setMediaFiles(existingMedia)
    } else {
      form.resetFields()
      setMediaFiles([])
    }
  }, [existingReview, mode, form, visible])

  // Upload images mutation
  const uploadImagesMutation = useMutation({
    mutationFn: (files: File[]) => reviewApi.uploadImages(files),
    onError: (error) => {
      console.error('Upload error:', error)
      message.error('Không thể tải lên hình ảnh. Vui lòng thử lại.')
    }
  })

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: (data: CreateReviewReqBody) => reviewApi.create(data),
    onSuccess: () => {
      message.success('Đánh giá đã được tạo thành công!')
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] })
      handleCancel()
    },
    onError: (error) => {
      console.error('Create review error:', error)
      message.error('Không thể tạo đánh giá. Vui lòng thử lại.')
    }
  })

  // Update review mutation
  const updateReviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateReviewReqBody }) => reviewApi.update(id, data),
    onSuccess: () => {
      message.success('Đánh giá đã được cập nhật thành công!')
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] })
      handleCancel()
    },
    onError: (error) => {
      console.error('Update review error:', error)
      message.error('Không thể cập nhật đánh giá. Vui lòng thử lại.')
    }
  })

  const handleCancel = () => {
    form.resetFields()
    setMediaFiles([])
    onCancel()
  }

  const handleSubmit = async (values: { content: string; rating: number }) => {
    try {
      setUploading(true)

      // Upload new files
      const newFiles = mediaFiles.filter((file) => file.file).map((file) => file.file!)
      let uploadedUrls: string[] = []

      if (newFiles.length > 0) {
        const uploadResponse = await uploadImagesMutation.mutateAsync(newFiles)
        uploadedUrls = uploadResponse.data.data.map((item) => item.url)
      }

      // Prepare media data
      const medias: Pick<ReviewMedia, 'url' | 'type'>[] = []

      // Add existing media (for edit mode)
      mediaFiles.forEach((file, index) => {
        if (!file.file) {
          // Existing media
          medias.push({
            url: file.url,
            type: file.type
          })
        } else {
          // New uploaded media
          const uploadedIndex = mediaFiles.filter((f, i) => i <= index && f.file).length - 1
          if (uploadedUrls[uploadedIndex]) {
            medias.push({
              url: uploadedUrls[uploadedIndex],
              type: file.type
            })
          }
        }
      })

      const reviewData = {
        content: values.content,
        rating: values.rating,
        productId,
        orderId,
        medias
      }

      if (mode === 'create') {
        await createReviewMutation.mutateAsync(reviewData)
      } else if (existingReview) {
        await updateReviewMutation.mutateAsync({
          id: existingReview.id,
          data: reviewData
        })
      }
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = (file: File) => {
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      message.error('Chỉ có thể tải lên hình ảnh hoặc video!')
      return false
    }

    if (file.size > 10 * 1024 * 1024) {
      message.error('Kích thước file không được vượt quá 10MB!')
      return false
    }

    if (mediaFiles.length >= 5) {
      message.error('Chỉ có thể tải lên tối đa 5 file!')
      return false
    }

    const mediaFile: MediaFile = {
      uid: `new-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      type: isImage ? 'IMAGE' : 'VIDEO',
      file
    }

    setMediaFiles((prev) => [...prev, mediaFile])
    return false // Prevent default upload
  }

  const handleRemoveMedia = (uid: string) => {
    setMediaFiles((prev) => {
      const updated = prev.filter((file) => file.uid !== uid)
      // Clean up object URLs for removed files
      const removedFile = prev.find((file) => file.uid === uid)
      if (removedFile?.file) {
        URL.revokeObjectURL(removedFile.url)
      }
      return updated
    })
  }

  const isLoading = createReviewMutation.isLoading || updateReviewMutation.isLoading || uploading

  return (
    <Modal
      title={
        <div className='flex items-center space-x-3'>
          <StarOutlined className='text-yellow-500' />
          <span>{mode === 'create' ? 'Đánh giá sản phẩm' : 'Chỉnh sửa đánh giá'}</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div className='mb-4 rounded-lg bg-gray-50 p-4'>
        <div className='flex items-center space-x-3'>
          <img src={productImage || '/placeholder.svg'} alt={productName} className='h-16 w-16 rounded object-cover' />
          <div>
            <Text strong className='text-base'>
              {productName}
            </Text>
            <div className='text-sm text-gray-500'>Đơn hàng #{orderId}</div>
          </div>
        </div>
      </div>

      <Form form={form} layout='vertical' onFinish={handleSubmit} disabled={isLoading}>
        <Form.Item
          name='rating'
          label='Đánh giá sao'
          rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá!' }]}
        >
          <Rate />
        </Form.Item>

        <Form.Item
          name='content'
          label='Nội dung đánh giá'
          rules={[
            { required: true, message: 'Vui lòng nhập nội dung đánh giá!' },
            { min: 10, message: 'Nội dung đánh giá phải có ít nhất 10 ký tự!' }
          ]}
        >
          <TextArea rows={4} placeholder='Chia sẻ trải nghiệm của bạn về sản phẩm này...' showCount maxLength={500} />
        </Form.Item>

        <Form.Item label='Hình ảnh/Video (Tùy chọn)'>
          <div className='space-y-3'>
            {mediaFiles.length > 0 && (
              <div className='grid grid-cols-3 gap-3'>
                {mediaFiles.map((file) => (
                  <div key={file.uid} className='group relative'>
                    {file.type === 'IMAGE' ? (
                      <Image
                        src={file.url || '/placeholder.svg'}
                        alt='Review media'
                        className='h-20 w-full rounded object-cover'
                        preview={false}
                      />
                    ) : (
                      <video src={file.url} className='h-20 w-full rounded object-cover' controls={false} />
                    )}
                    <Button
                      type='text'
                      danger
                      size='small'
                      icon={<DeleteOutlined />}
                      className='absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100'
                      onClick={() => handleRemoveMedia(file.uid)}
                    />
                  </div>
                ))}
              </div>
            )}

            {mediaFiles.length < 5 && (
              <Upload
                beforeUpload={handleFileUpload}
                showUploadList={false}
                accept='image/*,video/*'
                disabled={isLoading}
              >
                <Button icon={<PlusOutlined />} disabled={isLoading}>
                  Thêm hình ảnh/video ({mediaFiles.length}/5)
                </Button>
              </Upload>
            )}

            <Text type='secondary' className='text-xs'>
              Hỗ trợ: JPG, PNG, MP4. Tối đa 5 file, mỗi file không quá 10MB.
            </Text>
          </div>
        </Form.Item>

        {mode === 'edit' && existingReview && (
          <div className='mb-4 rounded border border-yellow-200 bg-yellow-50 p-3'>
            <Text type='warning' className='text-sm'>
              <strong>Lưu ý:</strong> Bạn chỉ có thể chỉnh sửa đánh giá này {1 - existingReview.updateCount} lần nữa.
            </Text>
          </div>
        )}

        <Divider />

        <div className='flex justify-end space-x-2'>
          <Button onClick={handleCancel} disabled={isLoading}>
            Hủy
          </Button>
          <Button type='primary' htmlType='submit' loading={isLoading} className='bg-blue-500 hover:bg-blue-600'>
            {mode === 'create' ? 'Gửi đánh giá' : 'Cập nhật đánh giá'}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
