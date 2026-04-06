import { useBuilderStore } from '../../../stores/builderStore.js'

function DragHandleSvg() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden="true" style={{ opacity: 0.35, flexShrink: 0 }}>
      <circle cx="2.5" cy="2" r="1.2"/><circle cx="7.5" cy="2" r="1.2"/>
      <circle cx="2.5" cy="7" r="1.2"/><circle cx="7.5" cy="7" r="1.2"/>
      <circle cx="2.5" cy="12" r="1.2"/><circle cx="7.5" cy="12" r="1.2"/>
    </svg>
  )
}

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
      <p className="cv-subheading">Разделы теории следуют друг за другом — перетащите для изменения порядка</p>

      <div className="th-sequence" id="theory-seq-list">
        {theories.length === 0 && (
          <p style={{ color: 'var(--muted-lt)', fontSize: 13, margin: '4px 0' }}>Нет элементов</p>
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
              <button className="th-drag-handle" title="Перетащите для изменения порядка" tabIndex={-1} type="button" onClick={e => e.stopPropagation()}>
                <DragHandleSvg />
              </button>
              <span className="item-card__icon">📄</span>
              <span className="item-card__title">{th.title}</span>
              <span className="item-card__arrow">›</span>
            </div>
          </div>
        ))}
      </div>

      {total < 3
        ? (
          <button className="add-dashed" onClick={() => addChild(node.id)}>
            + Добавить теорию
          </button>
        )
        : (
          <p style={{ fontSize: 12, color: 'var(--muted-lt)', margin: 0 }}>
            Достигнут максимум — 3 теоретических элемента на один блок
          </p>
        )
      }
    </div>
  )
}
