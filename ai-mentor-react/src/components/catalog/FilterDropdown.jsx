import { useState, useRef, useEffect } from 'react'

/**
 * Мульти-чекбокс дропдаун для фильтрации
 * value: 'all' | string | string[]
 */
export default function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Нормализуем значение в массив выбранных
  const selected = value === 'all' ? [] : Array.isArray(value) ? value : [value]

  const activeCount = selected.length
  const displayLabel = activeCount > 0 ? `${label} (${activeCount})` : label

  // Закрываем при клике снаружи
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function toggle(opt) {
    if (selected.includes(opt)) {
      const next = selected.filter((s) => s !== opt)
      onChange(next.length === 0 ? 'all' : next)
    } else {
      onChange([...selected, opt])
    }
  }

  function apply() {
    setOpen(false)
  }

  return (
    <div className={`dd${open ? ' dd--open' : ''}`} ref={ref}>
      <button
        className="dd__trigger"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {displayLabel}
        <svg className="dd__arrow" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div className="dd__panel dd__panel--sm">
        <div className="dd__list">
          {options.map((opt) => (
            <label key={opt} className="dd__check-item">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
        <div className="dd__footer">
          <button className="dd__apply" type="button" onClick={apply}>Применить</button>
        </div>
      </div>
    </div>
  )
}
