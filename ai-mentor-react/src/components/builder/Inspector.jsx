import { useState } from 'react'
import { useBuilderStore, ICONS } from '../../stores/builderStore.js'
import { builderService } from '../../builderServices/builderService.js'
import InfoTip from '../shared/InfoTip.jsx'
import {
  getNodeReadiness,
  getRecursiveReadiness,
  getStatus,
  getProgress,
  getIncompleteChildren,
  getIncompleteHierarchy,
} from '../../builderServices/readiness.js'

function ReadinessPanel({ node, parent }) {
  const selectNode = useBuilderStore((s) => s.selectNode)
  if (!node) return null

  const own = getNodeReadiness(node, parent)
  const recursive = getRecursiveReadiness(node, parent)
  const recStatus = getStatus(recursive.passed, recursive.total)
  const recProgress = getProgress(recursive.passed, recursive.total)

  const isUnitRoot = node.type === 'trainer' || node.type === 'exam'
  const hierarchy = isUnitRoot ? getIncompleteHierarchy(node) : []
  const incompleteChildren = isUnitRoot ? [] : getIncompleteChildren(node)
  const incompleteCount = isUnitRoot
    ? hierarchy.length
    : incompleteChildren.length
  const ownAllOk = own.problems.length === 0

  return (
    <div className="rd-panel">
      <div className="rd-panel__head">
        <span className="rd-panel__label">
          {isUnitRoot ? 'Готовность обучения' : 'Готовность блока'}
        </span>
        <span className={`rd-panel__pct rd-panel__pct--${recStatus}`}>{recProgress}%</span>
      </div>
      <div className="rd-panel__bar">
        <div
          className={`rd-panel__bar-fill rd-panel__bar-fill--${recStatus}`}
          style={{ width: `${recProgress}%` }}
        />
      </div>

      {!ownAllOk && (
        <details className="rd-panel__details" open>
          <summary>
            <span>Заполните в этом блоке</span>
            <span className="rd-panel__count">{own.problems.length}</span>
          </summary>
          <ul className="rd-panel__list">
            {own.problems.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </details>
      )}

      {incompleteCount > 0 && (
        <details className="rd-panel__details" open>
          <summary>
            <span>Не заполнены вложенные блоки</span>
            <span className="rd-panel__count">{incompleteCount}</span>
          </summary>
          <ul className="rd-panel__list rd-panel__list--linkable">
            {isUnitRoot
              ? hierarchy.map((top) => (
                  <li key={top.id}>
                    <button
                      type="button"
                      className="rd-panel__child-link"
                      onClick={() => selectNode(top.id)}
                      title={`Перейти к блоку «${top.title}»`}
                    >
                      <span className="rd-panel__child-title">{top.title}</span>
                      <span className="rd-panel__child-pct">{top.progress}%</span>
                    </button>
                    {top.nested.length > 0 && (
                      <ul className="rd-panel__sublist">
                        {top.nested.map((sub) => (
                          <li key={sub.id}>
                            <button
                              type="button"
                              className="rd-panel__child-link rd-panel__child-link--sub"
                              onClick={() => selectNode(sub.id)}
                              title={`Перейти к блоку «${sub.title}»`}
                            >
                              <span className="rd-panel__child-title">{sub.title}</span>
                              <span className="rd-panel__child-pct">{sub.progress}%</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))
              : incompleteChildren.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="rd-panel__child-link"
                      onClick={() => selectNode(c.id)}
                      title={`Перейти к блоку «${c.title}»`}
                    >
                      <span className="rd-panel__child-title">{c.title}</span>
                      <span className="rd-panel__child-pct">{c.progress}%</span>
                    </button>
                  </li>
                ))}
          </ul>
        </details>
      )}

      {ownAllOk && incompleteCount === 0 && (
        <div className="rd-panel__ok">✓ Всё заполнено</div>
      )}
    </div>
  )
}

function failLbl(v) {
  return v === 'retry' ? 'Повторная попытка' : v === 'end' ? 'Завершить' : v === 'skip' ? 'Пропустить' : 'По умолчанию'
}
function hintLbl(v) {
  return v === 'on_request' ? 'По запросу' : v === 'always' ? 'Всегда' : v === 'disabled' ? 'Отключено' : 'По умолчанию'
}
function hintsModeLbl(v) {
  return v === 'manual' ? 'Указываются вручную' : 'Генерируются автоматически'
}

const HINTS_MODE_INFO = (
  <>
    Задайте параметр поведения системы при неверном ответе на вопросы:
    <br /><br />
    <strong>Генерируются автоматически</strong> — система самостоятельно на основе критериев сформирует подсказки.
    <br /><br />
    <strong>Указываются вручную</strong> — вы сможете задать подсказки в каждом вопросе вручную.
  </>
)

function IGroup({ icon, label, info, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`ig${open ? ' is-open' : ''}`}>
      <button className="ig__head" type="button" onClick={() => setOpen(v => !v)}>
        <span className="ig__icon">{icon}</span>
        <span className="ig__label">{label}</span>
        {info && (
          <span onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', marginLeft: 4 }}>
            <InfoTip wide>{info}</InfoTip>
          </span>
        )}
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

function UnitInspector() {
  return null
}

function SectionInspector({ node }) {
  return <PassthroughInspector node={node} />
}

function CaseInspector({ node, updateNode }) {
  const s = node.settings || {}

  function bindSelect(key) {
    return e => {
      const val = e.target.value ? e.target.value : undefined
      updateNode(node.id, { settings: { ...s, [key]: val } })
    }
  }

  function bindHintsMode(e) {
    updateNode(node.id, { settings: { ...s, hintsMode: e.target.value } })
  }

  const minuteOpts = Array.from({ length: 15 }, (_, i) => {
    const m = i + 1
    const lbl = m === 1 ? '1 минута' : m < 5 ? `${m} минуты` : `${m} минут`
    return { value: m, label: lbl }
  })

  return (
    <>
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
      <IGroup icon="💡" label="Подсказки" info={HINTS_MODE_INFO} defaultOpen>
        <IField label="Режим подсказок">
          <select value={s.hintsMode || 'auto'} onChange={bindHintsMode}>
            <option value="auto">Генерируются автоматически</option>
            <option value="manual">Указываются вручную</option>
          </select>
        </IField>
      </IGroup>
    </>
  )
}

function QuestionInspector({ node, parentCase, updateNode }) {
  const s = node.settings || {}
  const noAbook = !!s.noAbook
  const [restrict, setRestrict] = useState(!!s.abookRestrict)

  const inheritedHintsMode = parentCase?.settings?.hintsMode || 'auto'
  const ownHintsMode = s.hintsMode // 'auto' | 'manual' | undefined

  function bindSelect(key) {
    return e => updateNode(node.id, { settings: { ...s, [key]: e.target.value || undefined } })
  }

  function bindHintsMode(e) {
    const val = e.target.value === 'inherit' ? undefined : e.target.value
    updateNode(node.id, { settings: { ...s, hintsMode: val } })
  }

  function toggleNoAbook(e) {
    const val = e.target.checked
    updateNode(node.id, { settings: { ...s, noAbook: val || undefined, abookRubric: undefined, abookRestrict: undefined, abookSection: undefined, abookArticles: undefined } })
    if (val) setRestrict(false)
  }

  function toggleRestrict(e) {
    const val = e.target.checked
    setRestrict(val)
    updateNode(node.id, { settings: { ...s, abookRestrict: val || undefined } })
  }

  return (
    <>
      <IGroup icon="📖" label="Информация из A-Book" defaultOpen>
      <div className="igf ig-toggle-row">
        <label className="ig-toggle">
          <input type="checkbox" checked={noAbook} onChange={toggleNoAbook} />
          <span className="ig-toggle__track" />
          <span className="ig-toggle__label">Без поиска по базе знаний</span>
        </label>
      </div>
      {!noAbook && (
        <>
          <p className="ig-desc" style={{ marginTop: 8 }}>Выберите рубрику, из которой AI будет получать справочную информацию для этого вопроса</p>
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
        </>
      )}
      </IGroup>
      <IGroup icon="💡" label="Подсказки" info={HINTS_MODE_INFO} defaultOpen>
        <IField label="Режим подсказок" inherited={!ownHintsMode}>
          <select value={ownHintsMode || 'inherit'} onChange={bindHintsMode}>
            <option value="inherit">По умолчанию ({hintsModeLbl(inheritedHintsMode)})</option>
            <option value="auto">Генерируются автоматически</option>
            <option value="manual">Указываются вручную</option>
          </select>
        </IField>
      </IGroup>
    </>
  )
}

function TheoryInspector({ node, updateNode }) {
  const s = node.settings || {}
  const noAbook = !!s.noAbook
  const [restrict, setRestrict] = useState(!!s.abookRestrict)

  function bindSelect(key) {
    return e => updateNode(node.id, { settings: { ...s, [key]: e.target.value || undefined } })
  }

  function toggleNoAbook(e) {
    const val = e.target.checked
    updateNode(node.id, { settings: { ...s, noAbook: val || undefined, abookRubric: undefined, abookRestrict: undefined, abookSection: undefined, abookArticles: undefined } })
    if (val) setRestrict(false)
  }

  function toggleRestrict(e) {
    const val = e.target.checked
    setRestrict(val)
    updateNode(node.id, { settings: { ...s, abookRestrict: val || undefined } })
  }

  return (
    <IGroup icon="🔗" label="Информация из A-Book" defaultOpen>
      <div className="igf ig-toggle-row">
        <label className="ig-toggle">
          <input type="checkbox" checked={noAbook} onChange={toggleNoAbook} />
          <span className="ig-toggle__track" />
          <span className="ig-toggle__label">Без поиска по базе знаний</span>
        </label>
      </div>
      {!noAbook && (
        <>
          <p className="ig-desc" style={{ marginTop: 8 }}>Выберите из какой рубрики получать информацию</p>
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
        </>
      )}
    </IGroup>
  )
}

function PassthroughInspector({ node }) {
  return (
    <div className="insp-empty">
      <div className="insp-empty__icon">{(node && ICONS[node.type]) || '⚙️'}</div>
      <div className="insp-empty__text">
        Для данного блока настройки конфигурации отсутствуют
      </div>
    </div>
  )
}

export default function Inspector() {
  const { unit, selectedId, updateUnit, updateNode } = useBuilderStore()

  if (!unit) return null

  let title = 'Инспектор'
  let activeNode = null
  let activeParent = null
  let body = (
    <div className="insp-empty">
      <div className="insp-empty__icon">🎛️</div>
      <div className="insp-empty__text">Выберите элемент в структуре, чтобы увидеть его настройки</div>
    </div>
  )

  if (selectedId === unit.id || !selectedId) {
    title = 'Единица обучения'
    activeNode = unit
    body  = <UnitInspector unit={unit} updateUnit={updateUnit} />
  } else {
    const node = builderService.findNode(unit, selectedId)
    if (node) {
      activeNode = node
      activeParent = builderService.findParent(unit, node.id)
      switch (node.type) {
        case 'question':
          title = 'Вопрос'
          body  = <QuestionInspector node={node} parentCase={activeParent} updateNode={updateNode} />
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
        {activeNode && <ReadinessPanel node={activeNode} parent={activeParent} />}
        {body}
      </div>
    </aside>
  )
}
