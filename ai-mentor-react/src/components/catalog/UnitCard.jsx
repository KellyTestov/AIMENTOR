import { useState, useRef, useEffect } from 'react'
import StatusBadge from '../shared/StatusBadge.jsx'
import { PROMPT_COVERS } from '../../shared/mock/units.js'
import { initials } from '../../core/utils.js'

const COVER_PLACEHOLDERS = PROMPT_COVERS

// Детерминированно выбираем обложку по id
function getPlaceholderCover(id) {
  const idx = id ? id.charCodeAt(id.length - 1) % COVER_PLACEHOLDERS.length : 0
  return COVER_PLACEHOLDERS[idx]
}

export default function UnitCard({ unit, currentUser, onAction }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const isPublished = unit.publicationStatus === 'published'
  const coverSrc = unit.coverUrl || getPlaceholderCover(unit.id)

  const canEdit = currentUser?.rights?.isAdmin || currentUser?.id === unit.authorId

  // Закрываем меню при клике снаружи
  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function action(type) {
    setMenuOpen(false)
    onAction(type, unit)
  }

  return (
    <article className="card">
      {/* Обложка */}
      <div className="card__media-wrap">
        <img src={coverSrc} alt="" className="card__media" aria-hidden="true" />
        {/* Меню карточки — всегда видно */}
        <div className="card__menu" ref={menuRef}>
          <button
            className="card__menu-toggle"
            type="button"
            aria-label="Действия с единицей обучения"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            ···
          </button>
          {menuOpen && (
            <ul className="card__menu-list" role="menu">
              <li role="none">
                <button className="card__menu-item" role="menuitem" type="button" onClick={() => action('open')}>
                  Открыть обучение
                </button>
              </li>
              {canEdit && (
                <>
                  <li role="none">
                    <button className="card__menu-item" role="menuitem" type="button" onClick={() => action('edit')}>
                      Редактировать единицу
                    </button>
                  </li>
                  <li role="none">
                    <button className="card__menu-item" role="menuitem" type="button" onClick={() => action('toggle-publicity')}>
                      {isPublished ? 'Скрыть' : 'Опубликовать'}
                    </button>
                  </li>
                  <li role="none">
                    <button className="card__menu-item card__menu-item--danger" role="menuitem" type="button" onClick={() => action('delete')}>
                      Удалить
                    </button>
                  </li>
                </>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Тело */}
      <div className="card__body">
        <h3 className="card__title">{unit.title}</h3>
        <div className="card__meta">
          {unit.durationLabel && (
            <span className="meta-badge">{unit.durationLabel}</span>
          )}
          <StatusBadge status={unit.publicationStatus} />
          <AuthorIcon name={unit.authorName} />
        </div>
      </div>
    </article>
  )
}

function AuthorIcon({ name }) {
  const abbr = initials(name)
  return (
    <span className="author-icon" title={name} aria-label={name}>
      <span className="author-initials" aria-hidden="true">{abbr}</span>
      <span className="author-tooltip">{name}</span>
    </span>
  )
}
