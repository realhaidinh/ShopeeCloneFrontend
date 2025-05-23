'use client'

import React from 'react'
import { Modal, Descriptions, Divider, Image, Tabs, Card, Typography } from 'antd'
import type { Category, CategoryTranslation } from 'src/types/category.type'
import type { Language } from 'src/types/language.type'
import { useQuery } from '@tanstack/react-query'
import languageApi from 'src/apis/language.api'
import categoryApi from 'src/apis/manageCategory.api'
import { formatDate } from 'src/utils/utils'

const { Text } = Typography
const { TabPane } = Tabs

interface CategoryDetailProps {
  visible: boolean
  category: Category
  onClose: () => void
}

export default function CategoryDetail({ visible, category, onClose }: CategoryDetailProps) {
  // Get languages for translation tabs
  const { data: languagesData } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languageApi.getList(),
    enabled: visible
  })

  // Group translations by language for easier access
  const translationsByLanguage = React.useMemo(() => {
    if (!category.categoryTranslations) return {}

    return category.categoryTranslations.reduce((acc, translation) => {
      acc[translation.languageId] = translation
      return acc
    }, {} as Record<string, CategoryTranslation>)
  }, [category.categoryTranslations])

  // Find parent category name
  const { data: parentCategoryData } = useQuery({
    queryKey: ['category', category.parentCategoryId],
    queryFn: () => {
      if (category.parentCategoryId) {
        return categoryApi.getDetailCategory(category.parentCategoryId)
      }
      return null
    },
    enabled: !!category.parentCategoryId && visible
  })

  return (
    <Modal title='Category Details' open={visible} onCancel={onClose} footer={null} width={800}>
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 20 }}>
        <Image
          src={category.logo || '/placeholder.svg?height=100&width=100'}
          alt={category.name}
          width={100}
          height={100}
          style={{ objectFit: 'cover', borderRadius: '8px', marginRight: '20px' }}
          fallback='/placeholder.svg?height=100&width=100'
        />
        <div>
          <h2 style={{ margin: 0 }}>{category.name}</h2>
          {category.parentCategoryId && (
            <p style={{ margin: '4px 0 0 0', color: 'rgba(0, 0, 0, 0.45)' }}>
              Parent: {parentCategoryData?.data?.name || 'Loading...'}
            </p>
          )}
        </div>
      </div>

      <Divider />

      <Descriptions bordered column={2}>
        <Descriptions.Item label='ID'>{category.id}</Descriptions.Item>
        <Descriptions.Item label='Parent ID'>{category.parentCategoryId || 'None'}</Descriptions.Item>
        <Descriptions.Item label='Created At'>{formatDate(category.createdAt)}</Descriptions.Item>
        <Descriptions.Item label='Updated At'>{formatDate(category.updatedAt)}</Descriptions.Item>
        <Descriptions.Item label='Created By'>{category.createdById}</Descriptions.Item>
        <Descriptions.Item label='Updated By'>{category.updatedById || '-'}</Descriptions.Item>
      </Descriptions>

      {category.deletedAt && (
        <>
          <Divider />
          <Descriptions bordered column={2}>
            <Descriptions.Item label='Deleted At'>{formatDate(category.deletedAt)}</Descriptions.Item>
            <Descriptions.Item label='Deleted By'>{category.deletedById || '-'}</Descriptions.Item>
          </Descriptions>
        </>
      )}

      <Divider orientation='left'>Translations</Divider>

      {category.categoryTranslations && category.categoryTranslations.length > 0 ? (
        <Tabs defaultActiveKey={category.categoryTranslations[0]?.languageId}>
          {languagesData?.data.data.map((language: Language) => {
            const translation = translationsByLanguage[language.id]
            return (
              <TabPane tab={language.name} key={language.id}>
                {translation ? (
                  <Card>
                    <Descriptions bordered column={1}>
                      <Descriptions.Item label='Name'>{translation.name}</Descriptions.Item>
                      <Descriptions.Item label='Description'>{translation.description}</Descriptions.Item>
                      <Descriptions.Item label='Created At'>{formatDate(translation.createdAt)}</Descriptions.Item>
                      <Descriptions.Item label='Updated At'>{formatDate(translation.updatedAt)}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                ) : (
                  <Text type='secondary'>No translation available for this language.</Text>
                )}
              </TabPane>
            )
          })}
        </Tabs>
      ) : (
        <Text type='secondary'>No translations available for this category.</Text>
      )}
    </Modal>
  )
}
