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
      <p className="cv-subheading">Приветственный экран перед началом обучения</p>

      {elements.map((el, idx) => (
        <div key={el.id} className="field-block" style={{ position: 'relative' }}>
          {elements.length > 1 && (
            <button
              className="tree-act-btn tree-act-btn--del"
              style={{ position: 'absolute', top: 0, right: 0 }}
              onClick={() => removeElement(idx)}
              title="Удалить блок"
            >×</button>
          )}
          <div className="field-block">
            <label className="field-lbl">Заголовок {idx + 1}</label>
            <input
              className="cv-inp"
              value={el.heading || ''}
              onChange={e => updateEl(idx, { heading: e.target.value })}
              placeholder="Заголовок онбординга..."
            />
          </div>
          <div className="field-block">
            <label className="field-lbl">Текст {idx + 1}</label>
            <textarea
              className="cv-textarea"
              rows={4}
              value={el.text || ''}
              onChange={e => updateEl(idx, { text: e.target.value })}
              placeholder="Опишите, о чём это обучение..."
            />
          </div>
        </div>
      ))}

      {elements.length < 2 && (
        <button className="add-dashed" onClick={addElement}>
          + Добавить блок текста
        </button>
      )}

      <div className="field-block" style={{ marginTop: 16 }}>
        <label className="field-lbl">Текст кнопки старта</label>
        <input
          className="cv-inp"
          value={content.startBtnText || ''}
          onChange={e => updateNodeFull(node.id, { ...content, startBtnText: e.target.value })}
          placeholder="Начать обучение"
        />
      </div>
    </div>
  )
}
