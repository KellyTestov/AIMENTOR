import { useSandboxStore } from '../../stores/sandboxStore.js'
import { CLIENT_CARD_SECTIONS } from '../../core/constants.js'

const PERSONAL_FIELDS = [
  { key: 'name',     label: 'ФИО' },
  { key: 'phone',    label: 'Телефон' },
  { key: 'account',  label: 'Счёт' },
  { key: 'status',   label: 'Статус' },
  { key: 'products', label: 'Продукты' },
  { key: 'request',  label: 'Запрос' },
]

export default function ClientCard({ onClose }) {
  const c = useSandboxStore(s => s.client)

  function displayValue(val) {
    if (Array.isArray(val)) return val.length ? val.join(', ') : null
    return val || null
  }

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

          {/* Личные данные */}
          <div className="sb-cc-section">
            <div className="sb-cc-section__title">Личные данные клиента</div>
            {PERSONAL_FIELDS.map(f => {
              const val = displayValue(c[f.key])
              return (
                <div key={f.key} className={`sb-client-row${f.key === 'request' ? ' sb-client-row--highlight' : ''}`}>
                  <span className="sb-client-label">{f.label}</span>
                  <span className={val ? '' : 'sb-client-empty'}>{val || '—'}</span>
                </div>
              )
            })}
          </div>

          {/* Все разделы из карточки клиента */}
          {CLIENT_CARD_SECTIONS.map(sec => {
            const secData = c[sec.key] || {}
            const hasAny = sec.fields.some(f => secData[f.key])
            return (
              <div key={sec.key} className="sb-cc-section">
                <div className="sb-cc-section__title">{sec.title}</div>
                {sec.fields.map(f => {
                  const val = secData[f.key] || null
                  return (
                    <div key={f.key} className="sb-client-row">
                      <span className="sb-client-label">{f.label}</span>
                      <span className={val ? '' : 'sb-client-empty'}>{val || '—'}</span>
                    </div>
                  )
                })}
              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}
