import { useState, useEffect } from 'react'
import { ModalDesktop } from '@alfalab/core-components/modal/esm/desktop'
import { Button } from '@alfalab/core-components/button/esm'
import { getTemplatesByFactory } from '../../builderServices/clientCardTemplates.js'

export default function ClientCardTemplateModal({ open, onClose, onPick, factory }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const factoryTemplates = getTemplatesByFactory(factory)
  const q = query.trim().toLowerCase()
  const visible = q
    ? factoryTemplates.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      )
    : factoryTemplates

  return (
    <ModalDesktop open={open} onClose={onClose} size={600} hasCloser={false}>
      <ModalDesktop.Header title="Выбор шаблона карточки клиента" hasCloser={false} />
      <ModalDesktop.Content>
        <div className="cct-toolbar">
          {factory && (
            <span className="cct-factory-badge">{factory}</span>
          )}
          <div className="cct-search">
            <svg className="cct-search__icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              className="cct-search__input"
              type="search"
              placeholder="Поиск по названию или описанию…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus={open}
            />
          </div>
        </div>

        {!factory && (
          <p className="cct-hint">
            Выберите готовую структуру карточки. Фабрика не задана — показаны все шаблоны.
          </p>
        )}

        {visible.length === 0 ? (
          <div className="cct-empty">
            <div className="cct-empty__icon">🔍</div>
            <div className="cct-empty__text">Ничего не найдено</div>
            <div className="cct-empty__sub">Попробуйте изменить запрос</div>
          </div>
        ) : (
          <div className="cct-list">
            {visible.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                className="cct-card"
                onClick={() => onPick(tpl.id)}
              >
                <div className="cct-card__icon">{tpl.icon}</div>
                <div className="cct-card__body">
                  <div className="cct-card__title">{tpl.name}</div>
                  <div className="cct-card__desc">{tpl.description}</div>
                  <div className="cct-card__meta">
                    {tpl.sections.length} разделов · {tpl.sections.reduce((acc, s) => acc + s.fields.length, 0)} полей
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
          <Button view="secondary" size={40} onClick={onClose}>Отмена</Button>
        </div>
      </ModalDesktop.Content>
    </ModalDesktop>
  )
}
