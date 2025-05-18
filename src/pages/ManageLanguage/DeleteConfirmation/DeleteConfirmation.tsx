import { Modal, Typography } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Language } from 'src/types/language.type'

const { Text } = Typography

interface DeleteConfirmationProps {
  visible: boolean
  language: Language
  onCancel: () => void
  onConfirm: () => void
  isLoading: boolean
}
export default function DeleteConfirmation({
  visible,
  language,
  onCancel,
  onConfirm,
  isLoading
}: DeleteConfirmationProps) {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>Delete Language</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      okText='Delete'
      cancelText='Cancel'
      okButtonProps={{
        danger: true,
        loading: isLoading
      }}
      centered
    >
      <p>Are you sure you want to delete this language?</p>
      <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, marginBottom: 16 }}>
        <Text strong>{language.id}</Text>
        <br />
        <Text type='secondary'>{language.name}</Text>
      </div>
      <p>This action cannot be undone.</p>
    </Modal>
  )
}
