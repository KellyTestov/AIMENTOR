import { ModalDesktop } from '@alfalab/core-components/modal/esm/desktop'
import { Button } from '@alfalab/core-components/button/esm'
import { CLIENT_CARD_TEMPLATES } from '../../builderServices/clientCardTemplates.js'

export default function ClientCardTemplateModal({ open, onClose, onPick }) {
  return (
    <ModalDesktop open={open} onClose={onClose} size={600} hasCloser={false}>
      <ModalDesktop.Header title="Выбор шаблона карточки клиента" hasCloser={false} />
      <ModalDesktop.Content>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
          Выберите готовую структуру карточки. Названия разделов и полей зафиксированы, вы только подставляете значения.
        </p>
        <div className="cct-list">
          {CLIENT_CARD_TEMPLATES.map((tpl) => (
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
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
          <Button view="secondary" size={40} onClick={onClose}>Отмена</Button>
        </div>
      </ModalDesktop.Content>
    </ModalDesktop>
  )
}
