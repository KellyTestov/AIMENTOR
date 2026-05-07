import { useBuilderStore } from '../../stores/builderStore.js'

function flatten(node, acc) {
  acc.push(node)
  for (const child of node.children || []) flatten(child, acc)
  return acc
}

export default function BuilderNav() {
  const { unit, selectedId, selectNode } = useBuilderStore()
  if (!unit) return null

  const flat = flatten(unit, [])
  if (flat.length < 2) return null

  const currentId = selectedId || unit.id
  const idx = flat.findIndex((n) => n.id === currentId)
  const prev = idx > 0 ? flat[idx - 1] : null
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null

  return (
    <div className="bld-nav">
      <button
        type="button"
        className="bld-btn bld-btn--ghost"
        disabled={!prev}
        onClick={() => prev && selectNode(prev.id)}
        title={prev ? prev.title : ''}
      >
        ‹ Назад
      </button>
      <button
        type="button"
        className="bld-btn bld-btn--primary"
        disabled={!next}
        onClick={() => next && selectNode(next.id)}
        title={next ? next.title : ''}
      >
        Далее ›
      </button>
    </div>
  )
}
