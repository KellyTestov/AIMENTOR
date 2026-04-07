import { Modal } from '@alfalab/core-components/modal/esm'
import { Button } from '@alfalab/core-components/button/esm'

export default function ConfirmModal({ open, title, description, onConfirm, onCancel, confirmLabel = 'Подтвердить', danger = false }) {
  return (
    <Modal open={open} onClose={onCancel} size={500} hasCloser={false}>
      <Modal.Header title={title} />
      {description && (
        <Modal.Content>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-light-text-secondary, #6b7280)', lineHeight: 1.5 }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </Modal.Content>
      )}
      <Modal.Controls
        layout="space-between"
        primary={
          <Button view="accent" size={48} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        }
        secondary={
          <Button view="outlined" size={48} onClick={onCancel}>
            Отмена
          </Button>
        }
      />
    </Modal>
  )
}
