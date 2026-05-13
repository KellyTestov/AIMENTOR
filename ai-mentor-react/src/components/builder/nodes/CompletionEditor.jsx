import { useBuilderStore, genId } from '../../../stores/builderStore.js'
import InfoTip from '../../shared/InfoTip.jsx'

const DEFAULT_AI_PROMPT = 'Дай позитивную обратную связь сотруднику в 3-4 предложениях. Выдели сильные стороны его ответов, мягко укажи на пробелы и предложи, на чём ещё можно сосредоточиться.'

const DEFAULT_METRICS = {
  score: true,
  correct: true,
  time: true,
  hintsUsed: false,
  bestWorstSection: false,
}

const DEFAULT_AI = {
  enabled: false,
  prompt: DEFAULT_AI_PROMPT,
  includeAnswers: true,
  includeScores: true,
  includeMistakes: true,
  includeHints: false,
  includeTime: false,
}

const METRIC_LABELS = {
  score:             'Общий балл',
  correct:           'Количество правильных ответов',
  time:              'Время прохождения',
  hintsUsed:         'Использовано подсказок',
  bestWorstSection:  'Лучший / худший раздел',
}

const AI_CONTEXT_LABELS = {
  includeAnswers:    'Список вопросов и ответы сотрудника',
  includeScores:     'Баллы по каждому вопросу',
  includeMistakes:   'Совершённые ошибки',
  includeHints:      'Использованные подсказки',
  includeTime:       'Время по каждому блоку',
}

const ON_FAIL_OPTIONS = [
  { value: 'retry',  label: 'Предложить пройти заново' },
  { value: 'end',    label: 'Просто закрыть обучение' },
  { value: 'mentor', label: 'Направить к куратору' },
]

export default function CompletionEditor({ node }) {
  const { unit, updateNodeFull } = useBuilderStore()

  const content  = node.content || {}
  const elements = content.elements && content.elements.length > 0
    ? content.elements
    : [{ id: genId('el'), heading: '', text: '' }]
  const metrics  = { ...DEFAULT_METRICS, ...(content.metrics || {}) }
  const ai       = { ...DEFAULT_AI, ...(content.aiFeedback || {}) }
  const passingScore = content.passingScore ?? 80
  const onFail   = content.onFail || 'retry'
  const finishBtnText = content.finishBtnText || ''

  const isExam = unit?.type === 'exam'

  function save(patch) {
    updateNodeFull(node.id, { ...content, elements, ...patch })
  }

  function updateEl(idx, patch) {
    const updated = elements.map((el, i) => i === idx ? { ...el, ...patch } : el)
    save({ elements: updated })
  }

  function toggleMetric(key) {
    save({ metrics: { ...metrics, [key]: !metrics[key] } })
  }

  function toggleAi(key) {
    save({ aiFeedback: { ...ai, [key]: !ai[key] } })
  }

  function setAi(patch) {
    save({ aiFeedback: { ...ai, ...patch } })
  }

  return (
    <div className="cv">
      <h2 className="cv-heading">
        <span className="cv-heading-icon">🏁</span>Завершение
      </h2>
      <p className="cv-subheading">
        Финал обучения — поздравление, сводка результатов и обратная связь от AI на основе пройденной сессии
      </p>

      {/* 1. Финальный экран */}
      <div className="enrich-section" style={{ marginTop: 0 }}>
        <div className="enrich-section__title-row">
          <span className="enrich-section__title">Финальный экран <span className="req-star">*</span></span>
          <InfoTip wide>То, что сотрудник увидит в конце обучения. Заголовок и текст кнопки обязательны, текст под заголовком опционален.</InfoTip>
        </div>
        {elements.map((el, idx) => (
          <div key={el.id} className="field-block">
            <label className="field-lbl">Заголовок</label>
            <input
              className="cv-inp"
              value={el.heading || ''}
              onChange={e => updateEl(idx, { heading: e.target.value })}
              placeholder="Например: Поздравляем! Обучение завершено"
            />
            <label className="field-lbl" style={{ marginTop: 8 }}>Текст</label>
            <textarea
              className="cv-textarea"
              rows={3}
              value={el.text || ''}
              onChange={e => updateEl(idx, { text: e.target.value })}
              placeholder="Например: Вы успешно прошли обучение. Используйте полученные знания в работе с клиентами."
            />
          </div>
        ))}
        <div className="field-block">
          <label className="field-lbl">Текст кнопки</label>
          <input
            className="cv-inp"
            value={finishBtnText}
            onChange={e => save({ finishBtnText: e.target.value })}
            placeholder="Например: Вернуться в каталог"
          />
          <div className="next-btn-preview" style={{ marginTop: 8 }}>
            <span className="next-btn-preview__lbl">Предпросмотр</span>
            <button className="next-btn-demo" type="button" disabled>
              <span>{finishBtnText || 'Вернуться в каталог'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Сводка по прохождению */}
      <div className="enrich-section">
        <div className="enrich-section__title-row">
          <span className="enrich-section__title">Сводка по прохождению</span>
          <InfoTip wide>Метрики, которые автоматически рассчитываются по сессии и показываются сотруднику в конце.</InfoTip>
        </div>
        <div className="field-block">
          {Object.entries(METRIC_LABELS).map(([key, label]) => (
            <label key={key} className="ig-toggle" style={{ padding: '6px 0' }}>
              <input
                type="checkbox"
                checked={!!metrics[key]}
                onChange={() => toggleMetric(key)}
              />
              <span className="ig-toggle__track" />
              <span className="ig-toggle__label">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3. AI-обратная связь */}
      <div className="enrich-section">
        <div className="enrich-section__title-row">
          <span className="enrich-section__title">AI-обратная связь</span>
          <InfoTip wide>AI получит данные о прохождении и сгенерирует персональный комментарий для сотрудника. Вы задаёте промпт и контекст, который подаётся в модель.</InfoTip>
        </div>
        <div className="field-block">
          <label className="ig-toggle" style={{ padding: '4px 0 12px' }}>
            <input
              type="checkbox"
              checked={!!ai.enabled}
              onChange={() => toggleAi('enabled')}
            />
            <span className="ig-toggle__track" />
            <span className="ig-toggle__label" style={{ fontWeight: 600 }}>
              Включить AI-обратную связь
            </span>
          </label>

          {ai.enabled && (
            <>
              <label className="field-lbl" style={{ marginTop: 4 }}>Промпт для модели</label>
              <textarea
                className="cv-textarea"
                rows={4}
                value={ai.prompt}
                onChange={e => setAi({ prompt: e.target.value })}
                placeholder={DEFAULT_AI_PROMPT}
              />

              <label className="field-lbl" style={{ marginTop: 14 }}>Что учитывать в контексте</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(AI_CONTEXT_LABELS).map(([key, label]) => (
                  <label key={key} className="ig-toggle" style={{ padding: '6px 0' }}>
                    <input
                      type="checkbox"
                      checked={!!ai[key]}
                      onChange={() => toggleAi(key)}
                    />
                    <span className="ig-toggle__track" />
                    <span className="ig-toggle__label">{label}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Порог прохождения — только для экзамена */}
      {isExam && (
        <div className="enrich-section">
          <div className="enrich-section__title-row">
            <span className="enrich-section__title">Порог прохождения</span>
            <InfoTip wide>Минимальный балл, при котором экзамен считается пройденным. Если сотрудник набрал меньше — выполняется заданное действие.</InfoTip>
          </div>
          <div className="field-block">
            <label className="field-lbl">Минимальный балл, %</label>
            <input
              type="number"
              className="cv-inp"
              min="0"
              max="100"
              value={passingScore}
              onChange={e => save({ passingScore: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
            />

            <label className="field-lbl" style={{ marginTop: 12 }}>При недостаточном балле</label>
            <select
              className="cv-inp"
              value={onFail}
              onChange={e => save({ onFail: e.target.value })}
            >
              {ON_FAIL_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
