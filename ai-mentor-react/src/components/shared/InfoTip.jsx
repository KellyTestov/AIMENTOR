import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

const PADDING = 12

export default function InfoTip({ children, wide = false }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)
  const triggerRef = useRef(null)
  const tipRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const trigger = triggerRef.current
    const tip = tipRef.current
    if (!trigger || !tip) return

    const rect = trigger.getBoundingClientRect()
    const tipRect = tip.getBoundingClientRect()
    const tipW = tipRect.width
    const tipH = tipRect.height

    let left = rect.left + rect.width / 2 - tipW / 2
    if (left + tipW > window.innerWidth - PADDING) {
      left = window.innerWidth - tipW - PADDING
    }
    if (left < PADDING) left = PADDING

    let top = rect.top - tipH - 8
    if (top < PADDING) top = rect.bottom + 8

    setPos({ top, left })
  }, [open])

  function show() { setOpen(true) }
  function hide() { setOpen(false); setPos(null) }

  return (
    <span
      ref={triggerRef}
      className="info-icon"
      tabIndex={0}
      role="img"
      aria-label="Подсказка"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      {open && createPortal(
        <span
          ref={tipRef}
          className={`info-tip-pop${wide ? ' info-tip-pop--wide' : ''}`}
          style={pos ? { top: pos.top, left: pos.left, visibility: 'visible' } : { visibility: 'hidden' }}
        >
          {children}
        </span>,
        document.body
      )}
    </span>
  )
}
