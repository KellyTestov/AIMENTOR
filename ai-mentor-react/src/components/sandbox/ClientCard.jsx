import { useSandboxStore } from '../../stores/sandboxStore.js'

export default function ClientCard({ onClose }) {
  const c = useSandboxStore(s => s.client)

  return (
    <div className="sb-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sb-modal sb-modal--wide sb-modal--scroll">
        <button className="sb-modal__close" onClick={onClose} title="Закрыть">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="sb-modal__icon" aria-hidden="true">👤</div>
        <h2 className="sb-modal__title">Данные клиента</h2>
        <div className="sb-client-card" id="sb-client-card">
          <div className="sb-client-row">
            <span className="sb-client-label">ФИО</span>
            <span>{c.name}</span>
          </div>
          <div className="sb-client-row">
            <span className="sb-client-label">Телефон</span>
            <span>{c.phone}</span>
          </div>
          <div className="sb-client-row">
            <span className="sb-client-label">Счёт</span>
            <span>{c.account}</span>
          </div>
          <div className="sb-client-row">
            <span className="sb-client-label">Статус</span>
            <span>{c.status}</span>
          </div>
          <div className="sb-client-row">
            <span className="sb-client-label">Продукты</span>
            <span>{c.products.join(', ')}</span>
          </div>
          <div className="sb-client-row sb-client-row--highlight">
            <span className="sb-client-label">Запрос</span>
            <span>{c.request}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
