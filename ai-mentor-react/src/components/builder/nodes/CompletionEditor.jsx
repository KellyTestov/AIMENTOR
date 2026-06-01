import { useBuilderStore, genId } from '../../../stores/builderStore.js'
import InfoTip from '../../shared/InfoTip.jsx'

const AI_PROMPT_PLACEHOLDER = 'Например: Дай позитивную обратную связь сотруднику в 3-4 предложениях. Выдели сильные стороны его ответов, мягко укажи на пробелы и предложи, на чём ещё можно сосредоточиться.'

const DEFAULT_METRICS = {
  score: true,
  correct: true,
  time: true,
  hintsUsed: false,
}

const DEFAULT_AI = {
  enabled: false,
  prompt: '',
  includeAnswers: true,
  includeScores: true,
  includeMistakes: true,
  includeHints: false,
  includeTime: false,
}

const DEFAULT_TIMER = {
  enabled: false,
  limitMinutes: 30,
  onExpire: 'none',
  expireTitle: '',
  expireText: '',
}

const METRIC_LABELS = {
  score:     'Общий балл',
  correct:   'Количество правильных ответов',
  time:      'Время прохождения',
  hintsUsed: 'Использовано подсказок',
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
  const timer    = { ...DEFAULT_TIMER, ...(content.timer || {}) }
  const passingScore = content.passingScore ?? 80
  const onFail   = content.onFail || 'retry'

  const isExam = unit?.type === 'exam'
  // sections: 1 final, 2 summary, 3 AI, [4 threshold exam], N timer
  const timerNum     = isExam ? 5 : 4
  const totalSections = timerNum

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

  function setTimer(patch) {
    save({ timer: { ...timer, ...patch } })
  }

  const limitH = Math.floor(timer.limitMinutes / 60)
  const limitM = timer.limitMinutes % 60

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
              placeholder={AI_PROMPT_PLACEHOLDER}
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

      {/* N. Таймер прохождения */}
      <ComplSection
        num={timerNum}
        title="Таймер прохождения"
        info="Ограничьте время на прохождение. Обратный отсчёт отображается в шапке сессии в реальном времени."
      >
        <label className="ig-toggle compl-toggle-row">
          <input
            type="checkbox"
            checked={!!timer.enabled}
            onChange={() => setTimer({ enabled: !timer.enabled })}
          />
          <span className="ig-toggle__track" />
          <span className="ig-toggle__label" style={{ fontWeight: 600 }}>Включить таймер</span>
        </label>

        {timer.enabled && (
          <>
            <label className="field-lbl" style={{ marginTop: 14 }}>Лимит времени</label>
            <div className="compl-timer-inputs">
              <input
                type="number"
                className="cv-inp compl-timer-inp"
                min="0"
                max="23"
                value={limitH}
                onChange={e => {
                  const h = Math.max(0, Math.min(23, parseInt(e.target.value) || 0))
                  setTimer({ limitMinutes: h * 60 + limitM })
                }}
              />
              <span className="compl-timer-unit">ч</span>
              <input
                type="number"
                className="cv-inp compl-timer-inp"
                min="0"
                max="59"
                value={limitM}
                onChange={e => {
                  const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                  setTimer({ limitMinutes: limitH * 60 + m })
                }}
              />
              <span className="compl-timer-unit">мин</span>
            </div>
            {timer.limitMinutes < 1 && (
              <p className="compl-timer-warn">Укажите хотя бы 1 минуту</p>
            )}

            <label className="field-lbl" style={{ marginTop: 16 }}>При истечении времени</label>
            <div className="compl-expire-options">
              <label className="compl-radio">
                <input
                  type="radio"
                  name={`timer-onExpire-${node.id}`}
                  value="none"
                  checked={timer.onExpire === 'none'}
                  onChange={() => setTimer({ onExpire: 'none' })}
                />
                <span>Не прерывать — сотрудник продолжает работу без уведомления</span>
              </label>
              <label className="compl-radio">
                <input
                  type="radio"
                  name={`timer-onExpire-${node.id}`}
                  value="warn_and_finish"
                  checked={timer.onExpire === 'warn_and_finish'}
                  onChange={() => setTimer({ onExpire: 'warn_and_finish' })}
                />
                <span>Уведомить и завершить — показать сообщение и автоматически закрыть сессию</span>
              </label>
            </div>

            {timer.onExpire === 'warn_and_finish' && (
              <div className="compl-expire-fields">
                <label className="field-lbl" style={{ marginTop: 12 }}>Заголовок уведомления</label>
                <input
                  className="cv-inp"
                  value={timer.expireTitle}
                  placeholder="Время истекло"
                  onChange={e => setTimer({ expireTitle: e.target.value })}
                />
                <label className="field-lbl" style={{ marginTop: 10 }}>Текст уведомления</label>
                <textarea
                  className="cv-textarea"
                  rows={2}
                  value={timer.expireText}
                  placeholder="К сожалению, время, отведённое на прохождение, истекло. Результаты будут зафиксированы автоматически."
                  onChange={e => setTimer({ expireText: e.target.value })}
                />
              </div>
            )}
          </>
        )}
      </ComplSection>
    </div>
  )
}
