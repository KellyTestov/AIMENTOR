import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useBuilderStore } from '../stores/builderStore.js'
import BuilderTree from '../components/builder/BuilderTree.jsx'
import NodeEditor from '../components/builder/NodeEditor.jsx'
import Inspector from '../components/builder/Inspector.jsx'
import '../builder.css'

export default function BuilderPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { unit, isDirty, error, load, updateUnit, save, publish } = useBuilderStore()
  const [saveFlash, setSaveFlash] = useState(false)

  useEffect(() => {
    const id = searchParams.get('id') || sessionStorage.getItem('bld-pending-id') || ''
    if (id) {
      sessionStorage.removeItem('bld-pending-id')
      load(id)
    }
  }, [load, searchParams])

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Ошибка</h2>
        <p>{error}</p>
        <button className="btn btn--secondary" onClick={() => navigate('/')}>← Каталог</button>
      </div>
    )
  }

  if (!unit) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Загрузка...</div>
  }

  function handleSave() {
    save()
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 2000)
  }

  function handlePublish() {
    publish()
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 2000)
  }

  function handleTitleChange(e) {
    updateUnit({ title: e.target.value })
  }

  const isPublished = unit.publicationStatus === 'published'

  return (
    <div className="bld-shell">
      {/* Header */}
      <header className="bld-header">
        <div className="bld-header__left">
          <button className="bld-btn bld-btn--ghost" onClick={() => navigate('/')}>
            ← Каталог
          </button>
          <div className="bld-header__div" />
          <input
            className="bld-title-input"
            id="unit-title-input"
            value={unit.title}
            maxLength={120}
            onChange={handleTitleChange}
            placeholder="Название обучения..."
          />
          <span
            id="unit-status"
            className={`bld-status${isPublished ? ' is-published' : ' is-private'}`}
          >
            {saveFlash
              ? '✓ Сохранено'
              : isDirty
                ? 'Изменения'
                : isPublished
                  ? 'Опубликовано'
                  : 'Черновик'
            }
          </span>
        </div>

        <div className="bld-header__right">
          <button
            id="btn-save"
            className="bld-btn bld-btn--ghost"
            onClick={handleSave}
            disabled={!isDirty}
          >
            Сохранить
          </button>
          <button
            id="btn-publish"
            className={`bld-btn${isPublished ? ' bld-btn--ghost' : ' bld-btn--primary'}`}
            onClick={handlePublish}
          >
            {isPublished ? 'Скрыть' : 'Опубликовать'}
          </button>
        </div>
      </header>

      {/* 3-panel layout */}
      <div className="bld-body">
        {/* Left panel — tree */}
        <aside className="bld-left">
          <div className="bld-left__head">
            <span className="bld-left__title">Структура</span>
          </div>
          <div className="bld-tree-wrap">
            <BuilderTree />
          </div>
        </aside>

        {/* Center — node editor */}
        <NodeEditor />

        {/* Right — inspector */}
        <Inspector />
      </div>
    </div>
  )
}
