import { createPortal } from 'react-dom'

export default function Modal({ open, onClose, children, className = '', zIndex = 20 }) {
  if (!open) return null

  return createPortal(
    <div
      className="modal-backdrop"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div className={`modal-dialog ${className}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  )
}
