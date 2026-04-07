import { Modal as AlfaModal } from '@alfalab/core-components/modal/esm'

export default function Modal({ open, onClose, children, size = 500 }) {
  return (
    <AlfaModal open={open} onClose={onClose} size={size} hasCloser={false}>
      {children}
    </AlfaModal>
  )
}
