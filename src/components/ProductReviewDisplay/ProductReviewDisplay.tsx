/* eslint-disable jsx-a11y/media-has-caption */
import { Card, Rate, Typography, Image, Button, Tag, Avatar } from 'antd'
import { EditOutlined, UserOutlined } from '@ant-design/icons'
import type { CreateReviewResBody } from 'src/types/review.type'

const { Text, Paragraph } = Typography

interface ProductReviewDisplayProps {
  review: CreateReviewResBody
  onEdit: () => void
  canEdit: boolean
}

export default function ProductReviewDisplay({ review, onEdit, canEdit }: ProductReviewDisplayProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  return (
    <Card className='mb-4'>
      <div className='mb-3 flex items-start justify-between'>
        <div className='flex items-center space-x-3'>
          <Avatar src={review.user.avatar} icon={<UserOutlined />} size={40} />
          <div>
            <Text strong>{review.user.name}</Text>
            <div className='flex items-center space-x-2'>
              <Rate disabled value={review.rating} className='text-sm' />
              <Text type='secondary' className='text-sm'>
                {formatDate(review.createdAt)}
              </Text>
            </div>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          {review.updateCount > 0 && <Tag color='blue'>Đã chỉnh sửa {review.updateCount} lần</Tag>}
          {canEdit && review.updateCount < 1 && (
            <Button type='text' icon={<EditOutlined />} onClick={onEdit} className='text-blue-500'>
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      <Paragraph className='mb-3'>{review.content}</Paragraph>

      {review.medias && review.medias.length > 0 && (
        <div className='grid grid-cols-4 gap-2'>
          {review.medias.map((media, index) => (
            <div key={media.id} className='relative'>
              {media.type === 'IMAGE' ? (
                <Image
                  src={media.url || '/placeholder.svg'}
                  alt={`Review media ${index + 1}`}
                  className='h-20 w-full rounded object-cover'
                />
              ) : (
                <video src={media.url} className='h-20 w-full rounded object-cover' controls />
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
