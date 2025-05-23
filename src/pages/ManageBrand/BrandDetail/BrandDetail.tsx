'use client'

import React from 'react'
import { Modal, Descriptions, Divider, Image, Tabs, Card, Typography } from 'antd'
import type { Brand, BrandTranslation } from 'src/types/brand.type'
import type { Language } from 'src/types/language.type'
import { useQuery } from '@tanstack/react-query'
import languageApi from 'src/apis/language.api'
import { formatDate } from 'src/utils/utils'

const { Text } = Typography
const { TabPane } = Tabs

interface BrandDetailProps {
  visible: boolean
  brand: Brand
  onClose: () => void
}

export default function BrandDetail({ visible, brand, onClose }: BrandDetailProps) {
  // Get languages for translation tabs
  const { data: languagesData } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languageApi.getList(),
    enabled: visible
  })

  // Group translations by language for easier access
  const translationsByLanguage = React.useMemo(() => {
    if (!brand.brandTranslations) return {}

    return brand.brandTranslations.reduce((acc, translation) => {
      acc[translation.languageId] = translation
      return acc
    }, {} as Record<string, BrandTranslation>)
  }, [brand.brandTranslations])

  return (
    <Modal title='Brand Details' open={visible} onCancel={onClose} footer={null} width={800}>
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 20 }}>
        <Image
          src={brand.logo || '/placeholder.svg?height=100&width=100'}
          alt={brand.name}
          width={100}
          height={100}
          style={{ objectFit: 'cover', borderRadius: '8px', marginRight: '20px' }}
          fallback='/placeholder.svg?height=100&width=100'
        />
        <div>
          <h2 style={{ margin: 0 }}>{brand.name}</h2>
        </div>
      </div>

      <Divider />

      <Descriptions bordered column={2}>
        <Descriptions.Item label='ID'>{brand.id}</Descriptions.Item>
        <Descriptions.Item label='Created At'>{formatDate(brand.createdAt)}</Descriptions.Item>
        <Descriptions.Item label='Updated At'>{formatDate(brand.updatedAt)}</Descriptions.Item>
        <Descriptions.Item label='Created By'>{brand.createdById}</Descriptions.Item>
        <Descriptions.Item label='Updated By'>{brand.updatedById || '-'}</Descriptions.Item>
      </Descriptions>

      {brand.deletedAt && (
        <>
          <Divider />
          <Descriptions bordered column={2}>
            <Descriptions.Item label='Deleted At'>{formatDate(brand.deletedAt)}</Descriptions.Item>
            <Descriptions.Item label='Deleted By'>{brand.deletedById || '-'}</Descriptions.Item>
          </Descriptions>
        </>
      )}

      <Divider orientation='left'>Translations</Divider>

      {brand.brandTranslations && brand.brandTranslations.length > 0 ? (
        <Tabs defaultActiveKey={brand.brandTranslations[0]?.languageId}>
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
        <Text type='secondary'>No translations available for this brand.</Text>
      )}
    </Modal>
  )
}
