import { useState } from 'react'
import { useBuilderStore, makeNode } from '../../../stores/builderStore.js'

const CC_SECTIONS = [
  { key: 'creditDetails', title: 'Детализация по кредитной карте клиента', fields: [
    { key: 'nearestPayment',   label: 'Ближайший платёж',                      ph: '2 200 ₽ до 20.12.2024' },
    { key: 'paymentSkip',      label: 'Пропуск платежа',                        ph: 'Не подключен' },
    { key: 'totalDebt',        label: 'Общая задолженность на сегодня',          ph: '3 140 ₽' },
    { key: 'purchases30',      label: 'Покупки в первые 30 дней',               ph: 'Льготный период не начался' },
    { key: 'purchasesFrom31',  label: 'Покупки с 31 дня и снятие наличных',     ph: 'Льготный период до 28.01.2026' },
    { key: 'repayOther',       label: 'Погашение КК в другом банке',            ph: 'Льготный период не начался' },
    { key: 'availableLimit',   label: 'Доступный лимит',                        ph: '7 860 ₽' },
    { key: 'overdueDebt',      label: 'Просроченная задолженность',             ph: '0 ₽' },
    { key: 'fines',            label: 'Штрафы и неустойки',                     ph: '0 ₽' },
  ]},
  { key: 'contractTerms', title: 'Общие условия договора', fields: [
    { key: 'totalCredit',   label: 'Общая сумма кредита',                    ph: '11 000 ₽' },
    { key: 'agreementDate', label: 'Подписание ДС о беспроцентном периоде',  ph: '16 ноября 2023' },
    { key: 'issueDate',     label: 'Дата выдачи',                            ph: '30 ноября 2023' },
  ]},
  { key: 'interestRates', title: 'Текущие процентные ставки', fields: [
    { key: 'rate30',   label: 'Покупки в первые 30 дней',    ph: '39,99% годовых' },
    { key: 'rateFrom31', label: 'Покупки с 31 дня',          ph: '39,99% годовых' },
    { key: 'rateCash', label: 'Снятие наличных',             ph: '49,99% годовых' },
    { key: 'rateRepay', label: 'Погашение КК в другом банке', ph: '49,99% годовых' },
  ]},
  { key: 'cardInfo', title: 'Информация по кредитной карте', fields: [
    { key: 'balance',     label: 'Баланс',                                           ph: '7 860 ₽' },
    { key: 'serviceCost', label: 'Стоимость обслуживания',                           ph: '0 ₽' },
    { key: 'cashLimit',   label: 'Лимит на снятие наличных без комиссии',            ph: 'до 50 000 ₽/мес' },
    { key: 'commAlfa',    label: 'Комиссия за снятие в банкоматах Альфа-Банка',      ph: '3,9% + 390 ₽' },
    { key: 'commOther',   label: 'Комиссия за снятие в сторонних банкоматах',        ph: '3,9% + 390 ₽' },
  ]},
]

function initClientCard(existing = {}) {
  const cc = { ...existing }
  CC_SECTIONS.forEach(sec => {
    if (!cc[sec.key]) cc[sec.key] = {}
    sec.fields.forEach(f => {
      if (cc[sec.key][f.key] === undefined) cc[sec.key][f.key] = ''
    })
  })
  return cc
}

export default function CaseEditor({ node }) {
  const { updateNodeFull, updateNode, addChild, selectNode } = useBuilderStore()
  const [openSections, setOpenSections] = useState(new Set([CC_SECTIONS[0].key]))

  const content    = node.content || {}
  const clientCard = initClientCard(content.clientCard)
  const questions  = (node.children || []).filter(c => c.type === 'question')

  function save(patch) {
    updateNodeFull(node.id, { ...content, clientCard, ...patch })
  }

  function updateCC(secKey, fieldKey, value) {
    const updated = {
      ...clientCard,
      [secKey]: { ...clientCard[secKey], [fieldKey]: value },
    }
    updateNodeFull(node.id, { ...content, clientCard: updated })
  }

  function toggleSection(key) {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function add5Questions() {
    for (let i = 0; i < 5; i++) {
      const num = node.children.length + 1
      node.children.push(makeNode('question', `Вопрос ${num}`, [], { text: '', criteria: [], hints: [], feedback: '' }))
    }
    save({})
  }

  return (
    <div className="cv">
      <div className="cv-title-row">
        <span className="cv-heading-icon">💼</span>
        <input
          className="cv-title-inp"
          value={node.title}
          maxLength={120}
          onChange={e => updateNode(node.id, { title: e.target.value })}
          placeholder="Название кейса..."
        />
      </div>
      <p className="cv-subheading">Сценарий кейса и список вопросов</p>

      <div className="field-block">
        <label className="field-lbl" htmlFor="case-desc">Описание кейса</label>
        <textarea
          className="cv-textarea"
          id="case-desc"
          rows={3}
          value={content.description || ''}
          onChange={e => save({ description: e.target.value })}
          placeholder="Опишите контекст или сценарий для этого кейса..."
        />
      </div>

      <div className="field-block">
        <div className="field-lbl" style={{ marginBottom: 10 }}>Карточка клиента</div>
        <div className="client-card">
          {CC_SECTIONS.map((sec, si) => (
            <div key={sec.key} className={`cc-group${openSections.has(sec.key) ? ' is-open' : ''}`}>
              <button className="cc-group__head" type="button" onClick={() => toggleSection(sec.key)}>
                <span>{sec.title}</span>
                <svg className="cc-group__chev" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="cc-group__body">
                {sec.fields.map(f => (
                  <div key={f.key} className="cc-row">
                    <span className="cc-row__label">{f.label}</span>
                    <input
                      className="cc-row__input"
                      value={clientCard[sec.key]?.[f.key] || ''}
                      placeholder={f.ph}
                      onChange={e => updateCC(sec.key, f.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="field-block">
        <div className="field-lbl" style={{ marginBottom: 10 }}>Вопросы ({questions.length})</div>
        <div className="q-list">
          {questions.length === 0 && (
            <p style={{ color: 'var(--muted-lt)', fontSize: 13, margin: '4px 0' }}>Нет вопросов</p>
          )}
          {questions.map((q, i) => (
            <div key={q.id} className="q-item" onClick={() => selectNode(q.id)} style={{ cursor: 'pointer' }}>
              <span className="q-item__num">{i + 1}</span>
              <span className="q-item__title">{q.title}</span>
              <span className="q-item__check">{q.content && q.content.text ? '✓' : '—'}</span>
            </div>
          ))}
        </div>
        <div className="btn-row" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="add-dashed add-dashed--sm" onClick={() => addChild(node.id)}>
            + Добавить вопрос
          </button>
          <button className="add-dashed add-dashed--sm" onClick={add5Questions}>
            + Добавить 5 вопросов
          </button>
        </div>
      </div>
    </div>
  )
}
