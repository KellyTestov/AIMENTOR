import Modal from './Modal.jsx'

export default function ConfirmModal({ open, title, description, onConfirm, onCancel, confirmLabel = 'Подтвердить', confirmClass = 'btn btn--danger' }) {
  return (
    <Modal open={open} onClose={onCancel}>
      <h2>{title}</h2>
      {description && <p dangerouslySetInnerHTML={{ __html: description }} />}
      <div className="modal-actions">
        <button className="btn btn--ghost" onClick={onCancel} type="button">Отмена</button>
        <button className={confirmClass} onClick={onConfirm} type="button">{confirmLabel}</button>
      </div>
    </Modal>
  )
}
