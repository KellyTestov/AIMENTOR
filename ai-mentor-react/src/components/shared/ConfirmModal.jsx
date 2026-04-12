import { ModalDesktop } from '@alfalab/core-components/modal/esm/desktop'
import { Button } from '@alfalab/core-components/button/esm'

export default function ConfirmModal({ open, title, description, onConfirm, onCancel, confirmLabel = 'Подтвердить' }) {
  return (
    <ModalDesktop open={open} onClose={onCancel} size={500} hasCloser={false}>
      <ModalDesktop.Header title={title} hasCloser={false} />
      <ModalDesktop.Content>
        {description && (
          <p
            style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--color-light-text-secondary, #6b7280)', lineHeight: 1.5 }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button view="secondary" size={40} onClick={onCancel}>
            Отмена
          </Button>
          <Button view="accent" size={40} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </ModalDesktop.Content>
    </ModalDesktop>
  )
}
