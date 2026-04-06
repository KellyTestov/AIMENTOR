import { useState } from 'react'
import { useBuilderStore, ICONS } from '../../stores/builderStore.js'
import { builderService } from '../../builderServices/builderService.js'

function failLbl(v) {
  return v === 'retry' ? 'Повторная попытка' : v === 'end' ? 'Завершить' : v === 'skip' ? 'Пропустить' : 'По умолчанию'
}
function hintLbl(v) {
  return v === 'on_request' ? 'По запросу' : v === 'always' ? 'Всегда' : v === 'disabled' ? 'Отключено' : 'По умолчанию'
}

function IGroup({ icon, label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`ig${open ? ' is-open' : ''}`}>
      <button className="ig__head" type="button" onClick={() => setOpen(v => !v)}>
        <span className="ig__icon">{icon}</span>
        <span className="ig__label">{label}</span>
        <svg className="ig__chev" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="ig__body">{children}</div>
    </div>
  )
}

function IField({ label, children, inherited }) {
  return (
    <div className="igf">
      <div className="igf__label">
        {label}
        {inherited && <span className="igf__inh"> унаследовано</span>}
      </div>
      {children}
    </div>
  )
}

function UnitInspector({ unit, updateUnit }) {
  const s = unit.settings || {}

  function bind(key, parse) {
    return e => {
      const val = parse ? parseInt(e.target.value) : e.target.value
      updateUnit({ settings: { ...s, [key]: val } })
    }
  }

  return (
    <>
      <IGroup icon="📊" label="Продуктовая оценка" defaultOpen>
        <IField label="Политика при провале" inherited>
          <select value={s.failPolicy || 'retry'} onChange={bind('failPolicy')}>
            <option value="retry">Повторная попытка</option>
            <option value="end">Завершить сессию</option>
            <option value="skip">Перейти к следующему</option>
          </select>
        </IField>
      </IGroup>
      <IGroup icon="🗣️" label="TOV — тональность" defaultOpen>
        <IField label="Стиль общения">
          <select value={s.tov || 'neutral'} onChange={bind('tov')}>
            <option value="neutral">Нейтральный</option>
            <option value="formal">Официальный</option>
            <option value="friendly">Дружелюбный</option>
          </select>
        </IField>
      </IGroup>
      <IGroup icon="⏱️" label="AHT — время ответа">
        <IField label="Таргет (сек)">
          <input type="number" value={s.ahtTarget || 120} min="10" max="600" onChange={bind('ahtTarget', true)} />
        </IField>
      </IGroup>
      <IGroup icon="🔇" label="Молчание">
        <IField label="Порог тишины (сек)">
          <input type="number" value={s.silenceThreshold || 10} min="5" max="120" onChange={bind('silenceThreshold', true)} />
        </IField>
      </IGroup>
      <IGroup icon="💡" label="Подсказки">
        <IField label="Политика подсказок">
          <select value={s.hintPolicy || 'on_request'} onChange={bind('hintPolicy')}>
            <option value="on_request">По запросу</option>
            <option value="always">Всегда показывать</option>
            <option value="disabled">Отключено</option>
          </select>
        </IField>
      </IGroup>
      <IGroup icon="💬" label="Обратная связь">
        <IField label="Тип по умолчанию">
          <select value={s.defaultFeedback || 'text'} onChange={bind('defaultFeedback')}>
            <option value="text">Текстовая</option>
            <option value="score">Оценка (баллы)</option>
            <option value="none">Без обратной связи</option>
          </select>
        </IField>
      </IGroup>
    </>
  )
}

function SectionInspector({ node, unitSettings, updateNode }) {
  const us = unitSettings || {}
  const s  = node.settings || {}

  function bind(key) {
    return e => {
      const val = e.target.value === 'inherit' ? undefined : e.target.value
      updateNode(node.id, { settings: { ...s, [key]: val } })
    }
  }

  return (
    <>
      <IGroup icon="📊" label="Оценка" defaultOpen>
        <IField label="Политика при провале" inherited>
          <select value={s.failPolicy || 'inherit'} onChange={bind('failPolicy')}>
            <option value="inherit">По умолчанию ({failLbl(us.failPolicy)})</option>
            <option value="retry">Повторная попытка</option>
            <option value="end">Завершить сессию</option>
            <option value="skip">Перейти к следующему</option>
          </select>
        </IField>
      </IGroup>
      <IGroup icon="💡" label="Подсказки">
        <IField label="Политика" inherited>
          <select value={s.hintPolicy || 'inherit'} onChange={bind('hintPolicy')}>
            <option value="inherit">По умолчанию ({hintLbl(us.hintPolicy)})</option>
            <option value="on_request">По запросу</option>
            <option value="always">Всегда</option>
            <option value="disabled">Отключено</option>
          </select>
        </IField>
      </IGroup>
      <IGroup icon="💬" label="Обратная связь">
        <IField label="Тип" inherited>
          <select value={s.defaultFeedback || 'inherit'} onChange={bind('defaultFeedback')}>
            <option value="inherit">По умолчанию</option>
            <option value="text">Текстовая</option>
            <option value="score">Баллы</option>
            <option value="none">Без обратной связи</option>
          </select>
        </IField>
      </IGroup>
    </>
  )
}

function CaseInspector({ node, updateNode }) {
  const s = node.settings || {}

  function bindSelect(key) {
    return e => {
      const val = e.target.value ? e.target.value : undefined
      updateNode(node.id, { settings: { ...s, [key]: val } })
    }
  }

  const minuteOpts = Array.from({ length: 15 }, (_, i) => {
    const m = i + 1
    const lbl = m === 1 ? '1 минута' : m < 5 ? `${m} минуты` : `${m} минут`
    return { value: m, label: lbl }
  })

  return (
    <IGroup icon="🔇" label="Параметр молчания" defaultOpen>
      <IField label="Время молчания" inherited>
        <select value={s.silenceMinutes || ''} onChange={bindSelect('silenceMinutes')}>
          <option value="">Из единицы обучения</option>
          {minuteOpts.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </IField>
      <IField label="Действие после молчания">
        <select value={s.silenceAction || ''} onChange={bindSelect('silenceAction')}>
          <option value="">Не задано</option>
          <option value="loyal">Лояльное сообщение оператору</option>
          <option value="negative">Негативное сообщение оператору</option>
          <option value="negative_multi">Несколько негативных сообщений оператору</option>
        </select>
      </IField>
    </IGroup>
  )
}

function QuestionInspector({ node, updateNode }) {
  const s = node.settings || {}
  const [restrict, setRestrict] = useState(!!s.abookRestrict)

  function bindSelect(key) {
    return e => updateNode(node.id, { settings: { ...s, [key]: e.target.value || undefined } })
  }

  function toggleRestrict(e) {
    const val = e.target.checked
    setRestrict(val)
    updateNode(node.id, { settings: { ...s, abookRestrict: val || undefined } })
  }

  return (
    <IGroup icon="📖" label="Информация из A-Book" defaultOpen>
      <p className="ig-desc">Выберите рубрику, из которой AI будет получать справочную информацию для этого вопроса</p>
      <IField label="Область поиска">
        <select value={s.abookRubric || ''} onChange={bindSelect('abookRubric')}>
          <option value="">Выберите рубрику...</option>
          <option value="retail">Розничный бизнес</option>
          <option value="corporate">Корпоративный бизнес</option>
          <option value="digital">Цифровые продукты</option>
          <option value="sme">МСБ</option>
        </select>
      </IField>
      <div className="igf ig-toggle-row">
        <label className="ig-toggle">
          <input type="checkbox" checked={restrict} onChange={toggleRestrict} />
          <span className="ig-toggle__track" />
          <span className="ig-toggle__label">Ограничить поиск по разделам рубрики</span>
        </label>
      </div>
      {restrict && (
        <IField label="Раздел">
          <select value={s.abookSection || ''} onChange={bindSelect('abookSection')}>
            <option value="">Выберите раздел...</option>
            <option value="credits">Кредитование</option>
            <option value="debit">Дебетовые карты</option>
            <option value="deposits">Вклады</option>
            <option value="insurance">Страхование</option>
          </select>
          <select style={{ marginTop: 8 }} value={s.abookArticles || ''} onChange={bindSelect('abookArticles')}>
            <option value="">Статьи раздела</option>
          </select>
          <div className="ig-hint">При выборе статей поиск будет осуществляться только по ним</div>
        </IField>
      )}
    </IGroup>
  )
}

function TheoryInspector({ node, updateNode }) {
  const s = node.settings || {}
  const [restrict, setRestrict] = useState(!!s.abookRestrict)

  function bindSelect(key) {
    return e => updateNode(node.id, { settings: { ...s, [key]: e.target.value || undefined } })
  }

  function toggleRestrict(e) {
    const val = e.target.checked
    setRestrict(val)
    updateNode(node.id, { settings: { ...s, abookRestrict: val || undefined } })
  }

  return (
    <IGroup icon="🔗" label="Информация из A-Book" defaultOpen>
      <p className="ig-desc">Выберите из какой рубрики получать информацию</p>
      <IField label="Область поиска">
        <select value={s.abookRubric || ''} onChange={bindSelect('abookRubric')}>
          <option value="">Выберите рубрику...</option>
          <option value="retail">Розничный бизнес</option>
          <option value="corporate">Корпоративный бизнес</option>
          <option value="digital">Цифровые продукты</option>
          <option value="sme">МСБ</option>
        </select>
      </IField>
      <div className="igf ig-toggle-row">
        <label className="ig-toggle">
          <input type="checkbox" checked={restrict} onChange={toggleRestrict} />
          <span className="ig-toggle__track" />
          <span className="ig-toggle__label">Ограничить поиск по разделам рубрики</span>
        </label>
      </div>
      {restrict && (
        <IField label="Раздел">
          <select value={s.abookSection || ''} onChange={bindSelect('abookSection')}>
            <option value="">Выберите раздел...</option>
            <option value="credits">Кредитование</option>
            <option value="debit">Дебетовые карты</option>
            <option value="deposits">Вклады</option>
            <option value="insurance">Страхование</option>
          </select>
          <select style={{ marginTop: 8 }} value={s.abookArticles || ''} onChange={bindSelect('abookArticles')}>
            <option value="">Статьи раздела</option>
          </select>
          <div className="ig-hint">При выборе статей поиск будет осуществляться только по ним</div>
        </IField>
      )}
    </IGroup>
  )
}

function PassthroughInspector({ node }) {
  return (
    <div className="insp-empty">
      <div className="insp-empty__icon">{ICONS[node.type] || '•'}</div>
      <div className="insp-empty__text">
        Настройки этого элемента управляются на уровне родительских сущностей.
        <br /><br />
        Выберите <strong>Вопрос</strong>, <strong>Кейс</strong> или <strong>Раздел</strong>, чтобы настроить параметры.
      </div>
    </div>
  )
}

export default function Inspector() {
  const { unit, selectedId, updateUnit, updateNode } = useBuilderStore()

  if (!unit) return null

  let title = 'Инспектор'
  let body  = (
    <div className="insp-empty">
      <div className="insp-empty__icon">🎛️</div>
      <div className="insp-empty__text">Выберите элемент в структуре, чтобы увидеть его настройки</div>
    </div>
  )

  if (selectedId === unit.id || !selectedId) {
    title = 'Единица обучения'
    body  = <UnitInspector unit={unit} updateUnit={updateUnit} />
  } else {
    const node = builderService.findNode(unit, selectedId)
    if (node) {
      switch (node.type) {
        case 'question':
          title = 'Вопрос'
          body  = <QuestionInspector node={node} updateNode={updateNode} />
          break
        case 'case':
          title = 'Кейс'
          body  = <CaseInspector node={node} updateNode={updateNode} />
          break
        case 'section':
          title = 'Раздел'
          body  = <SectionInspector node={node} unitSettings={unit.settings} updateNode={updateNode} />
          break
        case 'theory':
          title = 'Теория'
          body  = <TheoryInspector node={node} updateNode={updateNode} />
          break
        default:
          title = node.title
          body  = <PassthroughInspector node={node} />
      }
    }
  }

  return (
    <aside className="bld-right">
      <div className="bld-right__head">
        <span className="bld-right__title" id="inspector-title">{title}</span>
      </div>
      <div className="bld-right__body" id="inspector-body">
        {body}
      </div>
    </aside>
  )
}
