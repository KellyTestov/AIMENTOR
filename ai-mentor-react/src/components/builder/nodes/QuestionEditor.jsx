import { useState } from 'react'
import { useBuilderStore, genId } from '../../../stores/builderStore.js'
import { builderService } from '../../../builderServices/builderService.js'
import InfoTip from '../../shared/InfoTip.jsx'

const MOCK_ABOOK_RESP = `✅ Комиссия за услугу уведомлений по дебетовым картам составляет — 99 рублей.\n\n🚨 По кредитным комиссия составляет — 159 рублей.\n\n❌ Если клиент хочет оспорить списание — направь его на составление обращения «Комиссии»`

function initContent(c = {}) {
  const queries = (c.queries && c.queries.length > 0)
    ? c.queries.map(q => ({ id: q.id || genId('q'), text: q.text || '', response: q.response || '' }))
    : [{ id: genId('q'), text: '', response: '' }]

  const criteria = (c.criteria && c.criteria.length > 0)
    ? c.criteria
    : [{ id: genId('crit'), text: '', score: '' }]

  return {
    ...c,
    queries,
    criteria,
    queriesApproved: !!c.queriesApproved,
    queryResponse:   c.queryResponse || '',
    text:            c.text || '',
  }
}

export default function QuestionEditor({ node }) {
  const { unit, updateNodeFull, updateNode } = useBuilderStore()
  const [loading, setLoading] = useState(false)

  const raw = node.content || {}
  const content = initContent(raw)
  const { queries, criteria } = content

  const parentCase = unit ? builderService.findParent(unit, node.id) : null
  const isExam = unit?.type === 'exam'
  const effectiveHintsMode = isExam
    ? 'none'
    : (node.settings?.hintsMode || parentCase?.settings?.hintsMode || 'auto')
  const showHints = effectiveHintsMode === 'manual'

  const caseHasNoCard = parentCase?.content?.clientCard?.source === 'none'

  const noAbook     = !!node.settings?.noAbook
  const isApproved  = !!content.queriesApproved
  const isResponded = !loading && !isApproved && !!content.queryResponse
  const isLocked    = loading || isResponded || isApproved
  const allFilled   = queries.every(q => (q.text || '').trim().length > 0)

  const maxScoreNum = parseInt(content.maxScore) || 0
  const critSum     = criteria.reduce((acc, c) => acc + (parseInt(c.score) || 0), 0)
  const scoreOverflow = maxScoreNum > 0 && critSum > maxScoreNum

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

  function updateCritHint(id, hint) {
    save({ criteria: criteria.map(c => c.id === id ? { ...c, hint } : c) })
  }

  function addCrit() {
    if (criteria.length >= 10) return
    save({ criteria: [...criteria, { id: genId('crit'), text: '', score: '' }] })
  }

  function removeCrit(id) {
    if (criteria.length <= 1) return
    save({ criteria: criteria.filter(c => c.id !== id) })
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
      <p className="cv-subheading">Вопрос к участнику и чек-лист оценки ответа</p>

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

      {/* A-Book или ручной ввод ответа */}
      {noAbook ? (
        <div className="enrich-section">
          <div className="enrich-section__title-row">
            <span className="enrich-section__title">Эталонный ответ</span>
          </div>
          <p className="enrich-section__desc">
            Введите правильный ответ на вопрос выше — AI будет использовать его для оценки ответа сотрудника.
          </p>
          <div className="field-block">
            <label className="field-lbl">Текст</label>
            <textarea
              className="cv-textarea"
              rows={6}
              value={content.manualAnswer || ''}
              onChange={e => save({ manualAnswer: e.target.value })}
              placeholder="Опишите эталонный ответ на вопрос: что именно должен сказать сотрудник, чтобы ответ был засчитан как верный..."
            />
          </div>
        </div>
      ) : (
        <div className="enrich-section">
          <div className="enrich-section__title-row">
            <span className="enrich-section__title">Обогащение из базы знаний</span>
            <InfoTip wide>Вам необходимо указать запросы к базе знаний и получить из нее необходимую вам информацию, при прохождении обучения данные запросы будут автоматически направлены в A-Book и будут использованы для оценки ответа сотрудника</InfoTip>
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
      )}

      {/* Criteria */}
      <div className="field-block">
        <div className="crit-section-hd">
          <span className="field-lbl" style={{ margin: 0 }}>Чек-лист оценки ответа</span>
        </div>
        <p className="crit-section-desc">
          Добавьте пункты, которые должны быть в ответе сотрудника. AI проверит каждый пункт отдельно и начислит баллы.
        </p>

        {/* Max score per question */}
        <div className="qe-maxscore-row">
          <div className="qe-maxscore-row__info">
            <span className="qe-maxscore-row__label">Максимальный балл за вопрос</span>
            <span className="qe-maxscore-row__hint">
              Задайте общий максимум, затем распределите его по критериям ниже
            </span>
          </div>
          <div className="crit-card__score-pill qe-maxscore-pill">
            <input
              type="number"
              className="crit-card__score-inp"
              value={content.maxScore || ''}
              min="0"
              max="1000"
              placeholder="—"
              onChange={e => save({ maxScore: parseInt(e.target.value) || '' })}
            />
            <span className="crit-card__score-unit">б.</span>
          </div>
        </div>
        {scoreOverflow && (
          <div className="qe-score-warn">
            ⚠️ Сумма баллов по критериям ({critSum} б.) превышает максимальный балл за вопрос ({maxScoreNum} б.)
          </div>
        )}

        {!caseHasNoCard && (
          <label className="ig-toggle crit-section-toggle">
            <input
              type="checkbox"
              checked={!!content.useClientCard}
              onChange={e => save({ useClientCard: e.target.checked })}
            />
            <span className="ig-toggle__track" />
            <span className="ig-toggle__label">Учитывать карточку клиента</span>
            <InfoTip wide>При оценке ответа AI будет использовать данные из карточки клиента (статус, баланс, условия договора и т.п.). Включайте если вопрос требует от сотрудника опираться на индивидуальные данные клиента.</InfoTip>
          </label>
        )}
        <div className="crit-cards" id="crit-cards">
          {criteria.map((cr, i) => (
            <div key={cr.id} className="crit-card">
              <div className="crit-card__head">
                <span className="crit-card__num">{i + 1}</span>
                <span className="crit-card__field-lbl">Что проверяем в ответе?</span>
              </div>
              <div className="crit-card__row">
                <input
                  type="text"
                  className="crit-card__text"
                  value={cr.text}
                  placeholder="Например: Сотрудник верно указал комиссию по кредитной карте"
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
                  <button className="crit-card__del" onClick={() => removeCrit(cr.id)} title="Удалить пункт">×</button>
                )}
              </div>
              {showHints && (
                <div className="crit-card__hint">
                  <div className="crit-card__hint-lbl">
                    Подсказка <span className="req-star">*</span>
                    <InfoTip wide>Укажите подсказку, которую увидит сотрудник в случае если данный пункт чек-листа не будет выполнен при ответе на вопрос</InfoTip>
                  </div>
                  <input
                    type="text"
                    className="crit-card__text"
                    value={cr.hint || ''}
                    placeholder="Например: Обратите внимание на условия начисления процентов в случае просрочки"
                    onChange={e => updateCritHint(cr.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          className="add-dashed add-dashed--sm"
          style={{ marginTop: 8 }}
          onClick={addCrit}
          disabled={criteria.length >= 10}
          title={criteria.length >= 10 ? 'Максимум 10 пунктов' : ''}
        >
          + Добавить пункт оценки
        </button>
      </div>
    </div>
  )
}
