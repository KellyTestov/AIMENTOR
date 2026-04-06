import { useBuilderStore, genId } from '../../../stores/builderStore.js'

export default function OnboardingEditor({ node }) {
  const updateNodeFull = useBuilderStore(s => s.updateNodeFull)

  const content  = node.content || {}
  const elements = content.elements || []

  function updateEl(idx, patch) {
    const updated = elements.map((el, i) => i === idx ? { ...el, ...patch } : el)
    updateNodeFull(node.id, { ...content, elements: updated })
  }

  function addElement() {
    if (elements.length >= 2) return
    const updated = [...elements, { id: genId('el'), heading: '', text: '' }]
    updateNodeFull(node.id, { ...content, elements: updated })
  }

  function removeElement(idx) {
    const updated = elements.filter((_, i) => i !== idx)
    updateNodeFull(node.id, { ...content, elements: updated })
  }

  return (
    <div className="cv">
      <h2 className="cv-heading">
        <span className="cv-heading-icon">🚀</span>Онбординг
      </h2>
      <p className="cv-subheading">Введение в обучение для пользователя, укажите информацию с которой пользователь будет ознакомлен при его запуске</p>

      {elements.map((el, idx) => (
        <div key={el.id} className="field-block" style={{ position: 'relative' }}>
          {elements.length > 1 && (
            <button
              className="tree-act-btn tree-act-btn--del"
              style={{ position: 'absolute', top: 0, right: 0 }}
              onClick={() => removeElement(idx)}
              title="Удалить"
            >×</button>
          )}
          <div className="field-block">
            <label className="field-lbl">Заголовок {idx + 1} <span className="req-star">*</span></label>
            <input
              className="cv-inp"
              value={el.heading || ''}
              onChange={e => updateEl(idx, { heading: e.target.value })}
              placeholder="Например: Добро пожаловать в тренажер по кредитной карте"
            />
          </div>
          <div className="field-block">
            <label className="field-lbl">Текст {idx + 1}</label>
            <textarea
              className="cv-textarea"
              rows={4}
              value={el.text || ''}
              onChange={e => updateEl(idx, { text: e.target.value })}
              placeholder="Например: В данном обучении вы научитесь работать с кредитным картами и льготным периодом, а так же погрузитесь в тему перерасхода по счету"
            />
          </div>
        </div>
      ))}

      {elements.length < 2 && (
        <button className="add-dashed" onClick={addElement}>
          Добавить еще один элемент
        </button>
      )}

      <div className="enrich-section" style={{ marginTop: 16 }}>
        <div className="enrich-section__title">Кнопка перехода</div>
        <div className="field-block">
          <label className="field-lbl">Текст кнопки</label>
          <input
            className="cv-inp"
            value={content.startBtnText || ''}
            onChange={e => updateNodeFull(node.id, { ...content, startBtnText: e.target.value })}
            placeholder="Начать"
          />
          <div className="next-btn-preview" style={{ marginTop: 8 }}>
            <span className="next-btn-preview__lbl">Предпросмотр</span>
            <button className="next-btn-demo" type="button" disabled>
              <span>{content.startBtnText || 'Начать'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
