import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useBuilderStore } from '../stores/builderStore.js'
import { builderService } from '../builderServices/builderService.js'
import BuilderTree from '../components/builder/BuilderTree.jsx'
import NodeEditor from '../components/builder/NodeEditor.jsx'
import Inspector from '../components/builder/Inspector.jsx'
import '../builder.css'

function collectQuestions(node) {
  const results = []
  if (!node) return results
  if (node.type === 'question') { results.push(node); return results }
  for (const child of node.children || []) results.push(...collectQuestions(child))
  return results
}

export default function BuilderPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { unit, isDirty, error, load, updateUnit, save, publish, addTopBlock } = useBuilderStore()

  const [saveFlash, setSaveFlash]         = useState(false)
  const [checkToast, setCheckToast]       = useState(null)   // null | { ok, msg }
  const [moreOpen, setMoreOpen]           = useState(false)
  const [moreToast, setMoreToast]         = useState(null)
  const [showDirtyModal, setShowDirtyModal] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const moreRef = useRef(null)

  useEffect(() => {
    const id = searchParams.get('id') || sessionStorage.getItem('bld-pending-id') || ''
    if (id) {
      sessionStorage.removeItem('bld-pending-id')
      load(id)
    }
  }, [load, searchParams])

  // Close more dropdown on outside click
  useEffect(() => {
    if (!moreOpen) return
    function handler(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [moreOpen])

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

  function handleCheck() {
    const questions = collectQuestions(unit)
    const empty = questions.filter(q => !(q.content?.text || '').trim())
    if (empty.length === 0) {
      setCheckToast({ ok: true, msg: '✓ Проверка пройдена — ошибок не найдено' })
    } else {
      setCheckToast({ ok: false, msg: `⚠ Не заполнен текст у ${empty.length} вопрос${empty.length === 1 ? 'а' : 'ов'}` })
    }
    setTimeout(() => setCheckToast(null), 3000)
  }

  function handleCatalogClick() {
    if (isDirty) {
      setShowDirtyModal(true)
    } else {
      navigate('/')
    }
  }

  function handleMoreAction(action) {
    setMoreOpen(false)
    setMoreToast(`${action} — пока недоступно`)
    setTimeout(() => setMoreToast(null), 2500)
  }

  function handlePublishClick() {
    const isPublished = unit.publicationStatus === 'published'
    if (isPublished) {
      publish()
    } else {
      setShowPublishModal(true)
    }
  }

  function handlePublishOption(mode) {
    setShowPublishModal(false)
    publish()
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 2000)
    if (mode === 'sandbox') {
      setMoreToast('Юнит отправлен на тестирование')
      setTimeout(() => setMoreToast(null), 2500)
    }
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
          <button className="bld-btn bld-btn--ghost" onClick={handleCatalogClick}>
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
            id="btn-check"
            className="bld-btn bld-btn--ghost"
            onClick={handleCheck}
            title="Проверить заполнение"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }} aria-hidden="true">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Проверить
          </button>

          <div className="bld-more-wrap" ref={moreRef}>
            <button
              className="bld-btn bld-btn--ghost bld-btn--icon"
              onClick={() => setMoreOpen(v => !v)}
              title="Дополнительно"
              aria-haspopup="true"
              aria-expanded={moreOpen}
            >···</button>
            {moreOpen && (
              <div className="bld-dropdown">
                <button className="bld-dropdown__item" onClick={() => handleMoreAction('История версий')}>
                  История версий
                </button>
                <button className="bld-dropdown__item" onClick={() => handleMoreAction('Дублировать')}>
                  Дублировать
                </button>
              </div>
            )}
          </div>

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
            onClick={handlePublishClick}
          >
            {isPublished ? 'Снять с публикации' : 'Опубликовать'}
          </button>
        </div>
      </header>

      {/* 3-panel layout */}
      <div className="bld-body">
        {/* Left panel — tree */}
        <aside className="bld-left">
          <div className="bld-left__head">
            <span className="bld-left__title">Структура</span>
            <button
              className="bld-btn bld-btn--ghost bld-btn--icon"
              title="Добавить блок"
              onClick={addTopBlock}
              style={{ fontSize: 18, lineHeight: 1, padding: '0 6px' }}
            >+</button>
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

      {/* Toast: check result */}
      {checkToast && (
        <div className={`bld-toast is-vis`} style={{ background: checkToast.ok ? 'var(--surface)' : 'var(--surface)', borderLeft: `3px solid ${checkToast.ok ? '#22c55e' : '#f59e0b'}` }}>
          {checkToast.msg}
        </div>
      )}

      {/* Toast: more actions */}
      {moreToast && (
        <div className="bld-toast is-vis">{moreToast}</div>
      )}

      {/* Dirty modal */}
      {showDirtyModal && (
        <div className="bld-modal-backdrop" onClick={() => setShowDirtyModal(false)}>
          <div className="bld-modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'left' }}>
            <div className="bld-modal__title">Изменения не сохранены</div>
            <p className="bld-modal__desc" style={{ marginBottom: 24 }}>
              Вы внесли изменения в единицу обучения, но не сохранили их. Если перейти в каталог, изменения могут быть потеряны.
            </p>
            <div className="bld-modal__actions" style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <button className="bld-btn bld-btn--ghost" style={{ width: 'auto' }} onClick={() => setShowDirtyModal(false)}>
                Продолжить редактирование
              </button>
              <button className="bld-btn bld-btn--primary" style={{ width: 'auto' }} onClick={() => navigate('/')}>
                Перейти в каталог
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish modal */}
      {showPublishModal && (
        <div className="bld-modal-backdrop" onClick={() => setShowPublishModal(false)}>
          <div className="bld-modal" onClick={e => e.stopPropagation()}>
            <div className="bld-modal__title">Опубликовать обучение</div>
            <div className="bld-modal__options" style={{ marginBottom: 16 }}>
              <button className="bld-modal__option bld-modal__option--primary" onClick={() => handlePublishOption('sandbox')}>
                <span className="bld-modal__option-icon">🧪</span>
                <div className="bld-modal__option-body">
                  <div className="bld-modal__option-title">Тестирование</div>
                  <div className="bld-modal__option-desc">Предварительная проверка единицы обучения с возможностью внесения изменений</div>
                </div>
              </button>
              <button className="bld-modal__option" onClick={() => handlePublishOption('publish')}>
                <span className="bld-modal__option-icon">🚀</span>
                <div className="bld-modal__option-body">
                  <div className="bld-modal__option-title">Опубликовать</div>
                  <div className="bld-modal__option-desc">Опубликовать без дополнительной проверки</div>
                </div>
              </button>
            </div>
            <div className="bld-modal__actions" style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <button className="bld-btn bld-btn--ghost" style={{ width: 'auto' }} onClick={() => setShowPublishModal(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
