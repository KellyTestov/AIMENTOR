import { useState } from 'react'
import { useBuilderStore, ICONS, CHILD_TYPES } from '../../stores/builderStore.js'

const PROTECTED = new Set(['onboarding', 'completion'])
const CAN_ADD   = new Set(['unit', 'theory_block', 'practice', 'section', 'case'])

function PlusSvg() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function XSvg() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
      <path d="M1 1L8 8M8 1L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function DupSvg() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  )
}
function PencilSvg() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function RenameInline({ node, onDone }) {
  const [value, setValue] = useState(node.title)
  const updateNode = useBuilderStore(s => s.updateNode)

  function save() {
    const trimmed = value.trim()
    if (trimmed) updateNode(node.id, { title: trimmed })
    onDone()
  }

  return (
    <input
      className="tree-rename-inp"
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={e => {
        if (e.key === 'Enter') { e.preventDefault(); save() }
        if (e.key === 'Escape') onDone()
      }}
      autoFocus
      onClick={e => e.stopPropagation()}
    />
  )
}

function TreeNode({ node, depth, isRoot }) {
  const { selectedId, selectNode, addChild, deleteNode, duplicateNode } = useBuilderStore()
  const [expanded, setExpanded] = useState(true)
  const [renaming, setRenaming] = useState(false)

  const isSelected = selectedId === node.id
  const hasKids    = node.children && node.children.length > 0
  const icon       = ICONS[node.type] || '•'
  const isProtect  = PROTECTED.has(node.type)
  const canAdd     = CAN_ADD.has(node.type)
  const canRename  = node.type === 'theory'
  const indent     = depth * 16 + 8

  function handleSelect(e) {
    if (e.target.closest('[data-action]')) return
    selectNode(node.id)
  }

  function handleAdd(e) {
    e.stopPropagation()
    addChild(node.id)
  }

  function handleDelete(e) {
    e.stopPropagation()
    deleteNode(node.id)
  }

  function handleDuplicate(e) {
    e.stopPropagation()
    duplicateNode(node.id)
  }

  function handleRename(e) {
    e.stopPropagation()
    setRenaming(true)
  }

  return (
    <li className="tree-item" data-id={node.id}>
      <div
        className={`tree-row${isSelected ? ' is-selected' : ''}`}
        style={{ paddingLeft: indent }}
        onClick={handleSelect}
      >
        {hasKids
          ? (
            <button
              className="tree-toggle"
              data-action="toggle"
              onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
            >
              <svg width="10" height="10" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                <path
                  d={expanded ? 'M2.5 4.5L5.5 7.5L8.5 4.5' : 'M4.5 2.5L7.5 5.5L4.5 8.5'}
                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </button>
          )
          : <span className="tree-toggle tree-toggle--leaf" />
        }
        <span className="tree-icon">{icon}</span>
        {renaming
          ? <RenameInline node={node} onDone={() => setRenaming(false)} />
          : <span className="tree-label" title={node.title}>{node.title}</span>
        }
        {isRoot && (
          <span className="tree-type-tag">
            {node.type === 'trainer' ? 'Тренажёр' : 'Экзамен'}
          </span>
        )}
        <div className="tree-actions">
          {canAdd && (
            <button className="tree-act-btn" data-action="add" onClick={handleAdd} title="Добавить">
              <PlusSvg />
            </button>
          )}
          {canRename && (
            <button className="tree-act-btn" data-action="rename" onClick={handleRename} title="Переименовать">
              <PencilSvg />
            </button>
          )}
          {!isRoot && !isProtect && (
            <>
              <button className="tree-act-btn" data-action="dup" onClick={handleDuplicate} title="Дублировать">
                <DupSvg />
              </button>
              <button className="tree-act-btn tree-act-btn--del" data-action="del" onClick={handleDelete} title="Удалить">
                <XSvg />
              </button>
            </>
          )}
        </div>
      </div>
      {hasKids && expanded && (
        <ul className="bld-tree">
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} isRoot={false} />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function BuilderTree() {
  const unit = useBuilderStore(s => s.unit)
  if (!unit) return null

  return (
    <ul className="bld-tree bld-tree--root">
      <TreeNode node={unit} depth={0} isRoot />
    </ul>
  )
}
