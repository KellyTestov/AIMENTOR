import { useState } from 'react'
import { useBuilderStore, genId } from '../../../stores/builderStore.js'

const MOCK_ABOOK_RESP = `✅ Комиссия за услугу уведомлений по дебетовым картам составляет — 99 рублей.\n\n🚨 По кредитным комиссия составляет — 159 рублей.\n\n❌ Если клиент хочет оспорить списание — направь его на составление обращения «Комиссии»`

export default function TheoryEditor({ node }) {
  const { updateNodeFull, updateNode } = useBuilderStore()
  const [loading, setLoading] = useState(false)

  const content  = node.content || {}
  const elements = content.elements || [{ id: genId('el'), heading: '', text: '' }]
  const queries  = content.queries  || [{ id: genId('q'), text: '', response: '' }]
  const isApproved  = !!content.queriesApproved
  const isResponded = !loading && !isApproved && !!content.queryResponse
  const isLocked    = loading || isResponded || isApproved
  const allFilled   = queries.every(q => (q.text || '').trim().length > 0)

  function save(patch) {
    updateNodeFull(node.id, { ...content, elements, queries, ...patch })
  }

  function updateEl(idx, patch) {
    const updated = elements.map((el, i) => i === idx ? { ...el, ...patch } : el)
    save({ elements: updated })
  }

  function updateQuery(idx, text) {
    const updated = queries.map((q, i) => i === idx ? { ...q, text } : q)
    save({ queries: updated })
  }

  function addQuery() {
    if (queries.length >= 5) return
    save({ queries: [...queries, { id: genId('q'), text: '', response: '' }] })
  }

  function removeQuery(idx) {
    if (queries.length <= 1) return
    save({ queries: queries.filter((_, i) => i !== idx) })
  }

  function sendQueries() {
    save({})
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      updateNodeFull(node.id, { ...content, elements, queries, queryResponse: MOCK_ABOOK_RESP })
    }, 3000)
  }

  function approveAll() {
    save({ queriesApproved: true })
  }

  function changeAll() {
    save({ queryResponse: '', queriesApproved: false })
  }

  return (
    <div className="cv">
      <div className="cv-title-row">
        <span className="cv-heading-icon">📄</span>
        <input
          className="cv-title-inp"
          value={node.title}
          maxLength={120}
          onChange={e => updateNode(node.id, { title: e.target.value })}
          placeholder="Название теории..."
        />
      </div>

      {elements.map((el, idx) => (
        <div key={el.id} className="field-block">
          <label className="field-lbl">Заголовок</label>
          <input
            className="cv-inp"
            value={el.heading || ''}
            onChange={e => updateEl(idx, { heading: e.target.value })}
            placeholder="Заголовок раздела..."
          />
          <label className="field-lbl" style={{ marginTop: 8 }}>Текст</label>
          <textarea
            className="cv-textarea"
            rows={6}
            value={el.text || ''}
            onChange={e => updateEl(idx, { text: e.target.value })}
            placeholder="Содержимое теоретического материала..."
          />
        </div>
      ))}

      <div className="field-block">
        <label className="field-lbl">Текст кнопки «Далее»</label>
        <input
          className="cv-inp"
          value={content.nextBtnText || ''}
          onChange={e => save({ nextBtnText: e.target.value })}
          placeholder="Далее"
        />
        <button
          className="bld-btn bld-btn--primary"
          type="button"
          disabled
          style={{ marginTop: 8, opacity: 0.6, cursor: 'default', pointerEvents: 'none' }}
        >
          {content.nextBtnText || 'Далее'}
        </button>
      </div>

      <div className="field-block">
        <label className="field-lbl">Промпт</label>
        <textarea
          className="cv-textarea"
          rows={4}
          value={content.prompt || ''}
          onChange={e => save({ prompt: e.target.value })}
          placeholder="Введите промпт для генерации теоретического контента..."
        />
      </div>

      <div className="enrich-section">
        <div className="enrich-section__title-row">
          <span className="enrich-section__title">Обогащение из базы знаний</span>
        </div>
        <div className={`query-card${isApproved ? ' query-card--approved' : ''}`}>
          <div className="query-card__header">
            <span className="query-card__title">Тестовые запросы в A-Book</span>
          </div>
          <div>
            {queries.map((q, i) => (
              <div key={q.id} className="query-item">
                <div className="query-item__header">
                  <span className="query-item__label">Запрос {i + 1}</span>
                  {queries.length > 1 && !isLocked && (
                    <button className="query-item__del" onClick={() => removeQuery(i)}>×</button>
                  )}
                </div>
                <textarea
                  className={`query-textarea${isLocked ? ' query-textarea--locked' : ''}`}
                  disabled={isLocked}
                  value={q.text || ''}
                  onChange={e => updateQuery(i, e.target.value)}
                  placeholder="Например: Какая комиссия за услугу уведомлений..."
                />
              </div>
            ))}
          </div>
          {!isLocked && queries.length < 5 && (
            <button className="add-dashed add-dashed--sm" style={{ marginTop: 8, width: '100%' }} onClick={addQuery}>
              + Добавить запрос
            </button>
          )}
          {(isResponded || isApproved) && content.queryResponse && (
            <div className={`query-response${isApproved ? ' query-response--approved' : ''}`}>
              <div className="query-response__title">Ответ</div>
              <div className="query-response__text" style={{ whiteSpace: 'pre-wrap' }}>{content.queryResponse}</div>
            </div>
          )}
          <div className="query-footer">
            {loading && (
              <div className="query-sending">
                <span className="query-spinner" />Отправляем запросы...
              </div>
            )}
            {!loading && isApproved && (
              <div className="query-approved-note">✓ Все запросы утверждены</div>
            )}
            {!loading && isResponded && (
              <div className="query-actions">
                <button className="query-approve-btn" onClick={approveAll}>✓ Утвердить запросы</button>
                <button className="query-change-btn" onClick={changeAll}>✎ Изменить запросы</button>
              </div>
            )}
            {!loading && !isApproved && !isResponded && (
              <button className="query-send-btn" disabled={!allFilled} onClick={sendQueries}>
                ➤ Отправить
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
