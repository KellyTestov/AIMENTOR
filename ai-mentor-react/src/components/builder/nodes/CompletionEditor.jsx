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

function ComplSection({ num, title, info, children, accent = false }) {
  return (
    <section className={`compl-section${accent ? ' compl-section--accent' : ''}`}>
      <div className="compl-section__head">
        <span className="compl-section__num">{num}</span>
        <span className="compl-section__title">{title}</span>
        {info && <InfoTip wide>{info}</InfoTip>}
      </div>
      <div className="compl-section__body">
        {children}
      </div>
    </section>
  )
}

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

  const isExam = unit?.type === 'exam'
  const totalSections = isExam ? 4 : 3

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
        Финал обучения — поздравление, сводка результатов и обратная связь от AI на основе пройденной сессии. Шаги {totalSections > 0 ? `1–${totalSections}` : ''} выполняются по порядку.
      </p>

      {/* 1. Финальный экран */}
      <ComplSection
        num="1"
        title="Финальный экран"
        info="Информация, которую увидит сотрудник по завершению прохождения обучения"
      >
        {elements.map((el, idx) => (
          <div key={el.id}>
            <label className="field-lbl">Заголовок <span className="req-star">*</span></label>
            <input
              className="cv-inp"
              value={el.heading || ''}
              onChange={e => updateEl(idx, { heading: e.target.value })}
              placeholder="Например: Поздравляем! Обучение завершено"
            />
            <label className="field-lbl" style={{ marginTop: 12 }}>Текст</label>
            <textarea
              className="cv-textarea"
              rows={3}
              value={el.text || ''}
              onChange={e => updateEl(idx, { text: e.target.value })}
              placeholder="Например: Вы успешно прошли обучение. Используйте полученные знания в работе с клиентами."
            />
          </div>
        ))}
      </ComplSection>

      {/* 2. Сводка */}
      <ComplSection
        num="2"
        title="Сводка по прохождению"
        info="Метрики, которые автоматически рассчитываются по сессии и показываются сотруднику в конце."
      >
        <div className="compl-toggles">
          {Object.entries(METRIC_LABELS).map(([key, label]) => (
            <label key={key} className="ig-toggle compl-toggle-row">
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
      </ComplSection>

      {/* 3. AI feedback */}
      <ComplSection
        num="3"
        title="AI-обратная связь"
        info="AI получит данные о прохождении и сгенерирует персональный комментарий для сотрудника. Вы задаёте промпт и контекст, который подаётся в модель."
        accent
      >
        <label className="ig-toggle compl-ai-master">
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
          <div className="compl-ai-body">
            <label className="field-lbl">Промпт для модели <span className="req-star">*</span></label>
            <textarea
              className="cv-textarea"
              rows={4}
              value={ai.prompt}
              onChange={e => setAi({ prompt: e.target.value })}
              placeholder={DEFAULT_AI_PROMPT}
            />

            <label className="field-lbl" style={{ marginTop: 14 }}>Что учитывать в контексте</label>
            <div className="compl-toggles">
              {Object.entries(AI_CONTEXT_LABELS).map(([key, label]) => (
                <label key={key} className="ig-toggle compl-toggle-row">
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
          </div>
        )}
      </ComplSection>

      {/* 4. Exam threshold */}
      {isExam && (
        <ComplSection
          num="4"
          title="Порог прохождения"
          info="Минимальный балл, при котором экзамен считается пройденным. Если сотрудник набрал меньше — выполняется заданное действие."
        >
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
        </ComplSection>
      )}
    </div>
  )
}
