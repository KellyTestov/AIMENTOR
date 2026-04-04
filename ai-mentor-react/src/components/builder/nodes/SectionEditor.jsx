import { useBuilderStore } from '../../../stores/builderStore.js'

function countType(node, type) {
  let n = node.type === type ? 1 : 0
  for (const c of (node.children || [])) n += countType(c, type)
  return n
}

export default function SectionEditor({ node }) {
  const { selectNode, addChild, reorderChildren, updateNode } = useBuilderStore()
  const cases = (node.children || []).filter(c => c.type === 'case')
  const total = cases.length

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
      <div className="cv-title-row">
        <span className="cv-heading-icon">📁</span>
        <input
          className="cv-title-inp"
          value={node.title}
          maxLength={120}
          onChange={e => updateNode(node.id, { title: e.target.value })}
          placeholder="Название раздела..."
        />
      </div>
      <p className="cv-subheading">Кейсы следуют друг за другом — перетащите для изменения порядка</p>

      <div className="th-sequence">
        {cases.length === 0 && (
          <p style={{ color: 'var(--muted-lt)', fontSize: 13, margin: '4px 0' }}>Нет кейсов</p>
        )}
        {cases.map((c, idx) => (
          <div
            key={c.id}
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
            <div className="item-card th-seq-item__card" onClick={() => selectNode(c.id)} style={{ cursor: 'pointer' }}>
              <span className="item-card__icon">💼</span>
              <span className="item-card__title">{c.title}</span>
              <span className="item-card__meta">{countType(c, 'question')} вопр.</span>
              <span className="item-card__arrow">›</span>
            </div>
          </div>
        ))}
      </div>

      <button className="add-dashed" onClick={() => addChild(node.id)}>
        + Добавить кейс
      </button>
    </div>
  )
}
