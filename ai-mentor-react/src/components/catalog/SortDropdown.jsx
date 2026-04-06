import { useState, useRef, useEffect } from 'react'

const SORT_OPTIONS = [
  { value: 'updated_desc', label: 'Сначала новые изменения' },
  { value: 'created_desc', label: 'Сначала новые создания' },
  { value: 'name_asc',     label: 'По алфавиту А-Я' },
]

export default function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const label = 'Сортировка'

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className={`dd${open ? ' dd--open' : ''}`} ref={ref}>
      <button
        className="dd__trigger"
        type="button"
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <svg className="dd__arrow" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div className="dd__panel dd__panel--sm">
        <div className="dd__list">
          {SORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="dd__radio-item">
              <input
                type="radio"
                name="sort-radio"
                value={opt.value}
                checked={value === opt.value}
                onChange={() => { onChange(opt.value); setOpen(false) }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
