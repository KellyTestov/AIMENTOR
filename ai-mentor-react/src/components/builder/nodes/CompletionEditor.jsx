import { useBuilderStore, genId } from '../../../stores/builderStore.js'

export default function CompletionEditor({ node }) {
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
    if (elements.length <= 1) return
    const updated = elements.filter((_, i) => i !== idx)
    updateNodeFull(node.id, { ...content, elements: updated })
  }

  return (
    <div className="cv">
      <h2 className="cv-heading">
        <span className="cv-heading-icon">🏁</span>Завершение
      </h2>
      <p className="cv-subheading">Экран по окончании обучения</p>

      {elements.length === 0 && (
        <p style={{ color: 'var(--muted-lt)', fontSize: 13, margin: '4px 0' }}>Нет блоков</p>
      )}

      {elements.map((el, idx) => (
        <div key={el.id} className="field-block" style={{ position: 'relative', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
          {elements.length > 1 && (
            <button
              className="tree-act-btn tree-act-btn--del"
              style={{ position: 'absolute', top: 8, right: 8 }}
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
              placeholder="Заголовок экрана завершения..."
            />
          </div>
          <div className="field-block">
            <label className="field-lbl">Текст {idx + 1}</label>
            <textarea
              className="cv-textarea"
              rows={3}
              value={el.text || ''}
              onChange={e => updateEl(idx, { text: e.target.value })}
              placeholder="Поздравьте участника с завершением..."
            />
          </div>
        </div>
      ))}

      {elements.length < 2 && (
        <button className="add-dashed" style={{ marginTop: 8 }} onClick={addElement}>
          Добавить элемент
        </button>
      )}
    </div>
  )
}
