import { useState } from 'react'
import { genId, useBuilderStore } from '../../stores/builderStore.js'
import { instantiateTemplate, migrateLegacyClientCard, getTemplate } from '../../builderServices/clientCardTemplates.js'
import ClientCardTemplateModal from './ClientCardTemplateModal.jsx'
import ConfirmModal from '../shared/ConfirmModal.jsx'
import InfoTip from '../shared/InfoTip.jsx'

function newCustomSection(initialTitle = '') {
  return {
    id: genId('cc-sec'),
    title: initialTitle,
    collapsible: true,
    fields: [
      { id: genId('cc-fld'), label: '', value: '', placeholder: '' },
    ],
  }
}

function newCustomField() {
  return { id: genId('cc-fld'), label: '', value: '', placeholder: '' }
}

export default function ClientCard({ clientCard, onChange }) {
  const cc = migrateLegacyClientCard(clientCard)
  const factory = useBuilderStore((s) => s.unit?.factory || '')
  const [openSections, setOpenSections] = useState(() => {
    // По умолчанию открыта первая секция
    const set = new Set()
    if (cc.sections[0]) set.add(cc.sections[0].id)
    return set
  })
  const [tplModalOpen, setTplModalOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const isEmpty = cc.source == null
  const isTemplate = cc.source === 'template'
  const isCustom = cc.source === 'custom'
  const isNone = cc.source === 'none'

  function pickTemplate(templateId) {
    const sections = instantiateTemplate(templateId)
    onChange({ source: 'template', templateId, sections })
    setTplModalOpen(false)
    if (sections[0]) setOpenSections(new Set([sections[0].id]))
  }

  function startCustom() {
    const sections = [{
      id: genId('cc-sec'),
      title: 'Общая информация',
      collapsible: true,
      fields: [{ id: genId('cc-fld'), label: 'ФИО клиента', value: '', placeholder: '' }],
    }]
    onChange({ source: 'custom', templateId: null, sections })
    setOpenSections(new Set([sections[0].id]))
  }

  function pickNone() {
    onChange({ source: 'none', templateId: null, sections: [] })
  }

  function resetCard() {
    onChange({ source: null, templateId: null, sections: [] })
    setConfirmReset(false)
  }

  function toggleSection(id) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function updateField(secId, fieldId, patch) {
    const next = cc.sections.map((s) =>
      s.id !== secId ? s
        : { ...s, fields: s.fields.map((f) => f.id !== fieldId ? f : { ...f, ...patch }) })
    onChange({ ...cc, sections: next })
  }

  function updateSectionTitle(secId, title) {
    const next = cc.sections.map((s) => s.id !== secId ? s : { ...s, title })
    onChange({ ...cc, sections: next })
  }

  function addSection() {
    const sec = newCustomSection()
    onChange({ ...cc, sections: [...cc.sections, sec] })
    setOpenSections((prev) => new Set([...prev, sec.id]))
  }

  function removeSection(secId) {
    const next = cc.sections.filter((s) => s.id !== secId)
    onChange({ ...cc, sections: next })
  }

  function addField(secId) {
    const next = cc.sections.map((s) =>
      s.id !== secId ? s : { ...s, fields: [...s.fields, newCustomField()] })
    onChange({ ...cc, sections: next })
  }

  function removeField(secId, fieldId) {
    const next = cc.sections.map((s) =>
      s.id !== secId ? s : { ...s, fields: s.fields.filter((f) => f.id !== fieldId) })
    onChange({ ...cc, sections: next })
  }

  // ── Empty state: choice ─────────────────────────
  if (isEmpty) {
    return (
      <>
        <div className="cc-choice">
          <div className="cc-choice__lead">Выберите способ создания карточки клиента</div>
          <div className="cc-choice__row">
            <button type="button" className="cc-choice__card" onClick={() => setTplModalOpen(true)}>
              <div className="cc-choice__icon">📋</div>
              <div className="cc-choice__title">Из шаблона</div>
              <div className="cc-choice__desc">Готовая структура с типовыми полями под кейс</div>
            </button>
            <button type="button" className="cc-choice__card" onClick={startCustom}>
              <div className="cc-choice__icon">✨</div>
              <div className="cc-choice__title">С нуля</div>
              <div className="cc-choice__desc">Свои разделы и поля под нужды вашей бизнес-линии</div>
            </button>
            <button type="button" className="cc-choice__card" onClick={pickNone}>
              <div className="cc-choice__icon">⊘</div>
              <div className="cc-choice__title">Не создавать</div>
              <div className="cc-choice__desc">Если вопросы не связаны с конкретным клиентом</div>
            </button>
          </div>
        </div>
        <ClientCardTemplateModal
          open={tplModalOpen}
          onClose={() => setTplModalOpen(false)}
          onPick={pickTemplate}
          factory={factory}
        />
      </>
    )
  }

  // ── None state: card not used ──────────────────
  if (isNone) {
    return (
      <>
        <div className="cc-none">
          <div className="cc-none__icon">⊘</div>
          <div className="cc-none__text">
            Карточка клиента не используется в этом кейсе
          </div>
          <button
            type="button"
            className="cc-toolbar__reset"
            onClick={() => setConfirmReset(true)}
          >
            Изменить
          </button>
        </div>
        <ConfirmModal
          open={confirmReset}
          title="Изменить решение по карточке клиента?"
          description="Вы вернётесь к выбору способа создания карточки."
          confirmLabel="Изменить"
          onConfirm={resetCard}
          onCancel={() => setConfirmReset(false)}
        />
      </>
    )
  }

  // ── Filled state (template or custom) ─────────────
  const tpl = isTemplate ? getTemplate(cc.templateId) : null

  return (
    <>
      <div className="cc-toolbar">
        <span className="cc-toolbar__badge">
          {isTemplate
            ? `Шаблон: ${tpl?.name || cc.templateId}`
            : 'Создано с нуля'}
        </span>
        <button
          type="button"
          className="cc-toolbar__reset"
          onClick={() => setConfirmReset(true)}
          title="Удалить и выбрать заново"
        >
          Сбросить
        </button>
      </div>

      <div className="client-card">
        {cc.sections.map((sec) => {
          const isOpen = !sec.collapsible || openSections.has(sec.id)
          return (
            <div key={sec.id} className={`cc-group${isOpen ? ' is-open' : ''}${sec.collapsible ? '' : ' cc-group--personal'}`}>
              <div className="cc-group__head-row">
                {isCustom ? (
                  <>
                    <button
                      type="button"
                      className="cc-group__toggle"
                      onClick={() => toggleSection(sec.id)}
                      aria-label={isOpen ? 'Свернуть' : 'Развернуть'}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <input
                      className="cc-group__title-inp"
                      value={sec.title}
                      placeholder="Заполните название блока"
                      onChange={(e) => updateSectionTitle(sec.id, e.target.value)}
                    />
                    <button
                      type="button"
                      className="cc-group__del"
                      onClick={() => removeSection(sec.id)}
                      title="Удалить раздел"
                      aria-label="Удалить раздел"
                    >×</button>
                  </>
                ) : sec.collapsible ? (
                  <button
                    type="button"
                    className="cc-group__head"
                    onClick={() => toggleSection(sec.id)}
                  >
                    <span>{sec.title}</span>
                    <svg className="cc-group__chev" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : (
                  <div className="cc-group__head cc-group__head--static">
                    <span>{sec.title}</span>
                  </div>
                )}
              </div>

              {isOpen && (
                <div className="cc-group__body">
                  {sec.fields.map((f) => (
                    <div key={f.id} className={`cc-row${isCustom ? ' cc-row--custom' : ''}`}>
                      {isCustom ? (
                        <>
                          <input
                            className="cc-row__label-inp"
                            value={f.label}
                            placeholder="Заполните название поля"
                            onChange={(e) => updateField(sec.id, f.id, { label: e.target.value })}
                          />
                          <input
                            className="cc-row__input"
                            value={f.value || ''}
                            placeholder="Значение"
                            onChange={(e) => updateField(sec.id, f.id, { value: e.target.value })}
                          />
                          <button
                            type="button"
                            className="cc-row__del"
                            onClick={() => removeField(sec.id, f.id)}
                            title="Удалить поле"
                            aria-label="Удалить поле"
                          >×</button>
                        </>
                      ) : (
                        <>
                          <span className="cc-row__label">{f.label}</span>
                          <input
                            className="cc-row__input"
                            value={f.value || ''}
                            placeholder={f.placeholder}
                            onChange={(e) => updateField(sec.id, f.id, { value: e.target.value })}
                          />
                        </>
                      )}
                    </div>
                  ))}

                  {isCustom && (
                    <button
                      type="button"
                      className="add-dashed add-dashed--sm cc-add-field"
                      onClick={() => addField(sec.id)}
                    >
                      + Добавить поле
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {isCustom && (
          <button
            type="button"
            className="add-dashed cc-add-section"
            onClick={addSection}
          >
            + Добавить раздел
          </button>
        )}
      </div>

      <ConfirmModal
        open={confirmReset}
        title="Удалить карточку клиента?"
        description="Все заполненные данные будут потеряны. Вы вернётесь к выбору шаблона или режима «с нуля»."
        confirmLabel="Удалить"
        onConfirm={resetCard}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  )
}
