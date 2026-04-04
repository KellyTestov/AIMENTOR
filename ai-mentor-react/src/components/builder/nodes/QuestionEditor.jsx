import { useState } from 'react'
import { useBuilderStore, genId } from '../../../stores/builderStore.js'

const MOCK_ABOOK_RESP = `✅ Комиссия за услугу уведомлений по дебетовым картам составляет — 99 рублей.\n\n🚨 По кредитным комиссия составляет — 159 рублей.\n\n❌ Если клиент хочет оспорить списание — направь его на составление обращения «Комиссии»`

function initContent(c = {}) {
  const queries = (c.queries && c.queries.length > 0)
    ? c.queries.map(q => ({ id: q.id || genId('q'), text: q.text || '', response: q.response || '' }))
    : [{ id: genId('q'), text: '', response: '' }]

  const criteria = (c.criteria && c.criteria.length > 0)
    ? c.criteria
    : [
        { id: genId('crit'), text: '', score: '' },
        { id: genId('crit'), text: '', score: '' },
        { id: genId('crit'), text: '', score: '' },
      ]

  const hints = (c.hints || []).map(h =>
    typeof h === 'string'
      ? { id: genId('hint'), text: h, criteriaId: '' }
      : (h.id ? h : { id: genId('hint'), text: h.text || '', criteriaId: h.criteriaId || '' })
  )

  // Auto-link orphan hints to first criterion
  if (criteria.length > 0) {
    hints.forEach(h => { if (!h.criteriaId) h.criteriaId = criteria[0].id })
  }

  return {
    ...c,
    queries,
    criteria,
    hints,
    queriesApproved: !!c.queriesApproved,
    queryResponse:   c.queryResponse || '',
    text:            c.text || '',
  }
}

export default function QuestionEditor({ node }) {
  const { updateNodeFull, updateNode } = useBuilderStore()
  const [loading, setLoading] = useState(false)

  const raw = node.content || {}
  const content = initContent(raw)
  const { queries, criteria, hints } = content

  const isApproved  = !!content.queriesApproved
  const isResponded = !loading && !isApproved && !!content.queryResponse
  const isLocked    = loading || isResponded || isApproved
  const allFilled   = queries.every(q => (q.text || '').trim().length > 0)

  function save(patch) {
    updateNodeFull(node.id, { ...content, ...patch })
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
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      save({ queryResponse: MOCK_ABOOK_RESP })
    }, 3000)
  }

  function updateCritText(id, text) {
    save({ criteria: criteria.map(c => c.id === id ? { ...c, text } : c) })
  }

  function updateCritScore(id, score) {
    save({ criteria: criteria.map(c => c.id === id ? { ...c, score } : c) })
  }

  function addCrit() {
    if (criteria.length >= 3) return
    save({ criteria: [...criteria, { id: genId('crit'), text: '', score: '' }] })
  }

  function removeCrit(id) {
    if (criteria.length <= 1) return
    save({
      criteria: criteria.filter(c => c.id !== id),
      hints: hints.filter(h => h.criteriaId !== id),
    })
  }

  function addHint(criteriaId) {
    if (hints.length >= 10) return
    save({ hints: [...hints, { id: genId('hint'), text: '', criteriaId }] })
  }

  function updateHint(id, text) {
    save({ hints: hints.map(h => h.id === id ? { ...h, text } : h) })
  }

  function removeHint(id) {
    save({ hints: hints.filter(h => h.id !== id) })
  }

  return (
    <div className="cv">
      <div className="cv-title-row">
        <span className="cv-heading-icon">❓</span>
        <input
          className="cv-title-inp"
          value={node.title}
          maxLength={120}
          onChange={e => updateNode(node.id, { title: e.target.value })}
          placeholder="Название вопроса..."
        />
      </div>
      <p className="cv-subheading">Вопрос к участнику, критерии оценки и подсказки</p>

      <div className="field-block">
        <label className="field-lbl">Текст вопроса</label>
        <textarea
          className="cv-textarea"
          rows={4}
          value={content.text || ''}
          onChange={e => save({ text: e.target.value })}
          placeholder="Сформулируйте вопрос для сотрудника..."
        />
      </div>

      {/* A-Book */}
      <div className="enrich-section">
        <div className="enrich-section__title-row">
          <span className="enrich-section__title">Обогащение из базы знаний</span>
        </div>
        <div className={`query-card${isApproved ? ' query-card--approved' : ''}`}>
          <div className="query-card__header">
            <span className="query-card__title">Тестовые запросы в A-Book</span>
          </div>
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
            {loading && <div className="query-sending"><span className="query-spinner" />Отправляем запросы...</div>}
            {!loading && isApproved && <div className="query-approved-note">✓ Все запросы утверждены</div>}
            {!loading && isResponded && (
              <div className="query-actions">
                <button className="query-approve-btn" onClick={() => save({ queriesApproved: true })}>✓ Утвердить запросы</button>
                <button className="query-change-btn" onClick={() => save({ queryResponse: '', queriesApproved: false })}>✎ Изменить запросы</button>
              </div>
            )}
            {!loading && !isApproved && !isResponded && (
              <button className="query-send-btn" disabled={!allFilled} onClick={sendQueries}>➤ Отправить</button>
            )}
          </div>
        </div>
      </div>

      {/* Criteria */}
      <div className="field-block">
        <div className="crit-section-hd">
          <span className="field-lbl" style={{ margin: 0 }}>Критерии оценки</span>
        </div>
        <div className="crit-cards" id="crit-cards">
          {criteria.map((cr, i) => {
            const linked = hints.filter(h => h.criteriaId === cr.id)
            return (
              <div key={cr.id} className="crit-card">
                <div className="crit-card__row">
                  <span className="crit-card__num">{i + 1}</span>
                  <input
                    type="text"
                    className="crit-card__text"
                    value={cr.text}
                    placeholder="Опишите критерий оценки..."
                    onChange={e => updateCritText(cr.id, e.target.value)}
                  />
                  <div className="crit-card__score-pill">
                    <input
                      type="number"
                      className="crit-card__score-inp"
                      value={cr.score}
                      min="0" max="100"
                      placeholder="0"
                      onChange={e => updateCritScore(cr.id, e.target.value)}
                    />
                    <span className="crit-card__score-unit">б.</span>
                  </div>
                  {criteria.length > 1 && (
                    <button className="crit-card__del" onClick={() => removeCrit(cr.id)} title="Удалить критерий">×</button>
                  )}
                </div>
                {linked.length > 0 && (
                  <div className="crit-card__hints">
                    {linked.map(h => (
                      <div key={h.id} className="crit-hint">
                        <span className="crit-hint__icon">💡</span>
                        <textarea
                          className="crit-hint__body"
                          value={h.text}
                          placeholder="Подсказка для сотрудника..."
                          onChange={e => updateHint(h.id, e.target.value)}
                          rows={2}
                          style={{ resize: 'vertical', flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 13 }}
                        />
                        <button className="crit-hint__del" onClick={() => removeHint(h.id)} title="Удалить подсказку">×</button>
                      </div>
                    ))}
                  </div>
                )}
                <button className="crit-card__add-hint" onClick={() => addHint(cr.id)}>+ Подсказка</button>
              </div>
            )
          })}
        </div>
        {criteria.length < 3 && (
          <button className="add-dashed add-dashed--sm" style={{ marginTop: 8 }} onClick={addCrit}>
            + Добавить критерий
          </button>
        )}
      </div>
    </div>
  )
}
