import { useState } from 'react'
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

function PersonalRows({ c }) {
  function displayValue(val) {
    if (Array.isArray(val)) return val.length ? val.join(', ') : null
    return val || null
  }
  return PERSONAL_FIELDS.map(f => {
    const val = displayValue(c[f.key])
    return (
      <div key={f.key} className={`sb-client-row${f.key === 'request' ? ' sb-client-row--highlight' : ''}`}>
        <span className="sb-client-label">{f.label}</span>
        <span className={val ? '' : 'sb-client-empty'}>{val || '—'}</span>
      </div>
    )
  })
}

function SectionRows({ sec, c }) {
  const secData = c[sec.key] || {}
  return sec.fields.map(f => {
    const val = secData[f.key] ? String(secData[f.key]).trim() : null
    if (!val) return null
    return (
      <div key={f.key} className="sb-client-row">
        <span className="sb-client-label">{f.label}</span>
        <span>{val}</span>
      </div>
    )
  })
}

function CardContent({ c }) {
  function displayValue(val) {
    if (Array.isArray(val)) return val.length ? val.join(', ') : null
    return val || null
  }
  return (
    <div className="sb-client-card" id="sb-client-card">
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
      {CLIENT_CARD_SECTIONS.map(sec => {
        const secData = c[sec.key] || {}
        const hasAny = sec.fields.some(f => secData[f.key] && String(secData[f.key]).trim())
        if (!hasAny) return null
        return (
          <div key={sec.key} className="sb-cc-section">
            <div className="sb-cc-section__title">{sec.title}</div>
            <SectionRows sec={sec} c={c} />
          </div>
        )
      })}
    </div>
  )
}

function SidebarAccordion({ c }) {
  const [open, setOpen] = useState({})

  function toggle(key) {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="sb-client-card">
      {/* Личные данные — всегда открыты */}
      <div className="sb-cc-section">
        <div className="sb-cc-section__title">Личные данные клиента</div>
        <PersonalRows c={c} />
      </div>

      {/* Остальные секции — аккордеон */}
      {CLIENT_CARD_SECTIONS.map(sec => {
        const secData = c[sec.key] || {}
        const hasAny = sec.fields.some(f => secData[f.key] && String(secData[f.key]).trim())
        if (!hasAny) return null
        const isOpen = !!open[sec.key]
        return (
          <div key={sec.key} className="sb-cc-section">
            <button
              className={`sb-acc-toggle${isOpen ? ' is-open' : ''}`}
              onClick={() => toggle(sec.key)}
            >
              <span>{sec.title}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {isOpen && (
              <div className="sb-acc-body">
                <SectionRows sec={sec} c={c} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ClientCard({ onClose, sidebar }) {
  const c = useSandboxStore(s => s.client)

  if (sidebar) {
    return (
      <div className="sb-sidebar__inner">
        <div className="sb-sidebar__head">
          <span className="sb-sidebar__icon">👤</span>
          <div>
            <div className="sb-sidebar__name">{c.name}</div>
            <div className="sb-sidebar__status">{c.status}</div>
          </div>
        </div>
        <div className="sb-sidebar__section-title">О клиенте</div>
        <SidebarAccordion c={c} />
      </div>
    )
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
        <CardContent c={c} />
      </div>
    </div>
  )
}
