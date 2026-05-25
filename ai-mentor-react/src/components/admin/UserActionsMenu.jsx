import { useState, useRef, useEffect } from 'react'

/**
 * Поповер с действиями над пользователем.
 *
 * Props:
 *   canChangeLevel: bool
 *   canRevoke: bool
 *   onChangeLevel: () => void
 *   onRevoke: () => void
 */
export default function UserActionsMenu({ canChangeLevel, canRevoke, onChangeLevel, onRevoke }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const hasAnyAction = canChangeLevel || canRevoke

  return (
    <div className="ua-menu" ref={wrapRef}>
      <button
        type="button"
        className="ua-menu__trigger"
        onClick={() => setOpen((v) => !v)}
        disabled={!hasAnyAction}
        aria-haspopup="true"
        aria-expanded={open}
        title={hasAnyAction ? 'Действия' : 'Нет доступных действий'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      {open && (
        <div className="ua-menu__dropdown">
          {canChangeLevel && (
            <button
              type="button"
              className="ua-menu__item"
              onClick={() => { setOpen(false); onChangeLevel() }}
            >
              Изменить уровень
            </button>
          )}
          {canRevoke && (
            <button
              type="button"
              className="ua-menu__item ua-menu__item--danger"
              onClick={() => { setOpen(false); onRevoke() }}
            >
              Забрать доступ
            </button>
          )}
        </div>
      )}
    </div>
  )
}
