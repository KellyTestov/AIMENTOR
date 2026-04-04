import { useBuilderStore } from '../../../stores/builderStore.js'

export default function TheoryBlockEditor({ node }) {
  const { selectNode, addChild, reorderChildren } = useBuilderStore()
  const theories = (node.children || []).filter(c => c.type === 'theory')
  const total    = theories.length

  function handleDragStart(e, idx) {
    e.dataTransfer.setData('text/plain', String(idx))
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDrop(e, toIdx) {
    e.preventDefault()
    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'))
    if (isNaN(fromIdx) || fromIdx === toIdx) return
    reorderChildren(node.id, fromIdx, toIdx)
  }

  return (
    <div className="cv">
      <h2 className="cv-heading">
        <span className="cv-heading-icon">📚</span>{node.title}
      </h2>
      <p className="cv-subheading">Теоретические материалы — перетащите для изменения порядка</p>

      <div className="th-sequence" id="theory-seq-list">
        {theories.length === 0 && (
          <p style={{ color: 'var(--muted-lt)', fontSize: 13, margin: '4px 0' }}>Нет теоретических блоков</p>
        )}
        {theories.map((th, idx) => (
          <div
            key={th.id}
            className="th-seq-item"
            draggable
            onDragStart={e => handleDragStart(e, idx)}
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, idx)}
          >
            <div className="th-seq-item__track">
              <div className="th-seq-item__dot" />
              {idx < total - 1 && <div className="th-seq-item__line" />}
            </div>
            <div className="item-card th-seq-item__card" onClick={() => selectNode(th.id)} style={{ cursor: 'pointer' }}>
              <span className="item-card__icon">📄</span>
              <span className="item-card__title">{th.title}</span>
              <span className="item-card__arrow">›</span>
            </div>
          </div>
        ))}
      </div>

      <button className="add-dashed" onClick={() => addChild(node.id)}>
        + Добавить теорию
      </button>
    </div>
  )
}
