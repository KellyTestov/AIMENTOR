import { useMemo, useRef, useState } from 'react'
import { useAppStore } from '../../stores/appStore.js'
import { useAnalyticsStore } from '../../stores/analyticsStore.js'
import { FACTORIES, ALL_DIRECTIONS, DIRECTION_MAP } from '../../core/constants.js'
import { formatDate } from '../../core/utils.js'
import FilterDropdown from '../catalog/FilterDropdown.jsx'
import { Button } from '@alfalab/core-components/button/esm'
import { Input } from '@alfalab/core-components/input/esm'
import { Checkbox } from '@alfalab/core-components/checkbox/esm'
import { Select } from '@alfalab/core-components/select/esm'

const PERIODS = [
  { id: 'week',    label: 'Неделя' },
  { id: 'month',   label: 'Месяц' },
  { id: 'quarter', label: 'Квартал' },
  { id: 'year',    label: 'Год' },
  { id: 'custom',  label: 'Период' },
]

const STATUS_OPTIONS = [
  { value: 'all',         label: 'Все статусы' },
  { value: 'assigned',    label: 'Назначено' },
  { value: 'in_progress', label: 'В процессе' },
  { value: 'completed',   label: 'Завершено' },
]

function getDateBound(period) {
  const now = new Date()
  if (period === 'week') { const d = new Date(now); d.setDate(d.getDate() - 7); return d }
  if (period === 'month') { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d }
  if (period === 'quarter') { const d = new Date(now); d.setMonth(d.getMonth() - 3); return d }
  if (period === 'year') { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d }
  return null
}

function fmtTime(minutes) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}ч ${m}м` : `${m}м`
}

function statusLabel(s) {
  if (s === 'assigned') return 'Назначено'
  if (s === 'in_progress') return 'В процессе'
  if (s === 'completed') return 'Завершено'
  return s
}

function statusClass(s) {
  if (s === 'assigned') return 'an-status an-status--assigned'
  if (s === 'in_progress') return 'an-status an-status--progress'
  return 'an-status an-status--done'
}

export default function AnalyticsSection() {
  const sessions = useAppStore((s) => s.analyticsSessions)
  const { period, customFrom, customTo, status, factories, directions,
    unitSearch, sortByPopularity, selectedEmployeeId, employeeSearchText } = useAnalyticsStore()
  const setFilter = useAnalyticsStore((s) => s.setFilter)
  const reset = useAnalyticsStore((s) => s.reset)

  const [empText, setEmpText] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Уникальные сотрудники
  const employees = useMemo(() => {
    const map = new Map()
    sessions.forEach((s) => {
      if (!map.has(s.employeeId)) map.set(s.employeeId, s.employeeName)
    })
    return [...map.entries()].map(([id, name]) => ({ id, name }))
  }, [sessions])

  const suggestions = useMemo(() => {
    if (!empText) return []
    const q = empText.toLowerCase()
    return employees.filter((e) => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)).slice(0, 8)
  }, [employees, empText])

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId)

  // Фильтрация
  const filtered = useMemo(() => {
    let list = sessions

    // Период
    if (period !== 'custom') {
      const bound = getDateBound(period)
      if (bound) list = list.filter((s) => s.startDate && new Date(s.startDate) >= bound)
    } else {
      if (customFrom) list = list.filter((s) => !s.startDate || new Date(s.startDate) >= new Date(customFrom))
      if (customTo) list = list.filter((s) => !s.startDate || new Date(s.startDate) <= new Date(customTo))
    }
    if (status !== 'all') list = list.filter((s) => s.status === status)
    if (factories.length > 0) list = list.filter((s) => factories.includes(s.direction?.split(' ')?.[0]) || factories.some((f) => (DIRECTION_MAP[f] || []).includes(s.direction)))
    if (directions.length > 0) list = list.filter((s) => directions.includes(s.direction))
    if (unitSearch) { const q = unitSearch.toLowerCase(); list = list.filter((s) => s.unitTitle.toLowerCase().includes(q)) }
    if (selectedEmployeeId) list = list.filter((s) => s.employeeId === selectedEmployeeId)

    if (sortByPopularity) {
      const counts = new Map()
      list.forEach((s) => counts.set(s.unitId, (counts.get(s.unitId) || 0) + 1))
      list = [...list].sort((a, b) => (counts.get(b.unitId) || 0) - (counts.get(a.unitId) || 0))
    }

    return list
  }, [sessions, period, customFrom, customTo, status, factories, directions, unitSearch, selectedEmployeeId, sortByPopularity])

  // Метрики
  const metrics = useMemo(() => {
    const completed = filtered.filter((s) => s.status === 'completed')
    const inProgress = filtered.filter((s) => s.status === 'in_progress')
    const assigned = filtered.filter((s) => s.status === 'assigned')
    const avgTime = completed.length ? Math.round(completed.reduce((a, s) => a + (s.activeTimeMinutes || 0), 0) / completed.length) : 0
    const avgScore = completed.filter((s) => s.score != null).length
      ? Math.round(completed.filter((s) => s.score != null).reduce((a, s) => a + s.score, 0) / completed.filter((s) => s.score != null).length)
      : null
    const avgAttempts = completed.length ? (completed.reduce((a, s) => a + (s.attempts || 1), 0) / completed.length).toFixed(1) : null
    return { assigned: assigned.length, inProgress: inProgress.length, completed: completed.length, avgTime, avgScore, avgAttempts }
  }, [filtered])

  function exportData() {
    const XLSX = window.XLSX
    if (XLSX) {
      const rows = filtered.map((s) => ({
        'Единица обучения': s.unitTitle,
        'Направление': s.direction,
        'Сотрудник': s.employeeName,
        'Статус': statusLabel(s.status),
        'Назначено': s.assignedDate ? formatDate(new Date(s.assignedDate)) : '',
        'Начато': s.startDate ? formatDate(new Date(s.startDate)) : '',
        'Завершено': s.endDate ? formatDate(new Date(s.endDate)) : '',
        'Время (мин)': s.activeTimeMinutes || 0,
        'Оценка': s.score ?? '',
        'Попыток': s.attempts || 1,
      }))
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(rows)
      XLSX.utils.book_append_sheet(wb, ws, 'Аналитика')
      XLSX.writeFile(wb, 'analytics.xlsx')
    } else {
      // Fallback: CSV
      const cols = ['Единица обучения','Направление','Сотрудник','Статус','Время (мин)','Оценка']
      const rows = filtered.map((s) => [s.unitTitle, s.direction, s.employeeName, statusLabel(s.status), s.activeTimeMinutes || 0, s.score ?? ''].join(';'))
      const csv = '\uFEFF' + [cols.join(';'), ...rows].join('\n')
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
      a.download = 'analytics.csv'
      a.click()
    }
  }

  const availableDirections = useMemo(() => {
    if (factories.length === 0) return ALL_DIRECTIONS
    return [...new Set(factories.flatMap((f) => DIRECTION_MAP[f] || []))]
  }, [factories])

  return (
    <section className="section section--analytics" aria-label="Аналитика">
      {/* Toolbar */}
      <div id="an-toolbar">
        {/* Периоды */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <div className="an-period-tabs">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                className={`an-period-tab${period === p.id ? ' is-active' : ''}`}
                type="button"
                onClick={() => setFilter('period', p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
          {period === 'custom' && (
            <div className="an-daterange">
              <input className="an-date-input" type="date" value={customFrom} onChange={(e) => setFilter('customFrom', e.target.value)} />
              <span className="an-date-sep">—</span>
              <input className="an-date-input" type="date" value={customTo} onChange={(e) => setFilter('customTo', e.target.value)} />
            </div>
          )}
        </div>
        {/* Фильтры */}
        <div className="toolbar-controls">
          <Select
            label="Статус"
            options={STATUS_OPTIONS.map((o) => ({ key: o.value, content: o.label }))}
            selected={{ key: status, content: STATUS_OPTIONS.find((o) => o.value === status)?.label || status }}
            onChange={({ selected }) => selected && setFilter('status', selected.key)}
            size={40}
            optionsListWidth="content"
          />
          <FilterDropdown label="Фабрика" options={FACTORIES} value={factories.length ? factories : 'all'} onChange={(v) => setFilter('factories', v === 'all' ? [] : Array.isArray(v) ? v : [v])} />
          <FilterDropdown label="Направление" options={availableDirections} value={directions.length ? directions : 'all'} onChange={(v) => setFilter('directions', v === 'all' ? [] : Array.isArray(v) ? v : [v])} />
          <Input
            size={40}
            placeholder="Поиск по обучению..."
            value={unitSearch}
            onChange={(_, { value }) => setFilter('unitSearch', value)}
            clear
          />
          <Checkbox
            label="По популярности"
            checked={sortByPopularity}
            onChange={(_, { checked }) => setFilter('sortByPopularity', checked)}
          />
          <Button view="outlined" size={40} onClick={exportData}>Экспорт</Button>
          <Button view="outlined" size={40} onClick={reset}>Сбросить</Button>
        </div>
      </div>

      {/* Метрики */}
      <div className="an-metrics">
        <div className="an-metric"><span className="an-metric__label">Среднее время</span><span className="an-metric__value">{fmtTime(metrics.avgTime)}</span></div>
        <div className="an-metric an-metric--assigned"><span className="an-metric__label">Назначено</span><span className="an-metric__value">{metrics.assigned}</span></div>
        <div className="an-metric an-metric--progress"><span className="an-metric__label">В процессе</span><span className="an-metric__value">{metrics.inProgress}</span></div>
        <div className="an-metric an-metric--done"><span className="an-metric__label">Завершено</span><span className="an-metric__value">{metrics.completed}</span></div>
        <div className="an-metric"><span className="an-metric__label">Средний балл</span><span className="an-metric__value">{metrics.avgScore ?? '—'}</span></div>
        <div className="an-metric"><span className="an-metric__label">Попыток</span><span className="an-metric__value">{metrics.avgAttempts ?? '—'}</span></div>
      </div>

      {/* Поиск сотрудника */}
      <div className="an-employee-bar" style={{ position: 'relative' }}>
        <div className="an-employee-search-wrap">
          <svg className="an-employee-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <input
            type="search"
            placeholder={selectedEmployee ? selectedEmployee.name : 'Поиск сотрудника...'}
            value={empText}
            onChange={(e) => { setEmpText(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />
          {selectedEmployeeId && (
            <button className="an-emp-clear" type="button" aria-label="Очистить" onClick={() => { setFilter('selectedEmployeeId', null); setEmpText('') }}>×</button>
          )}
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="an-suggestions">
            {suggestions.map((e) => (
              <button key={e.id} className="an-suggestion-item" type="button"
                onMouseDown={() => { setFilter('selectedEmployeeId', e.id); setEmpText(''); setShowSuggestions(false) }}>
                {e.name}
                <code className="an-sug-userid">{e.id}</code>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Таблица */}
      {filtered.length > 0 ? (
        <div className="an-table-card">
          <div className="an-table-wrap">
            <table className="an-table">
              <thead>
                <tr>
                  <th>Единица обучения</th>
                  <th>Направление</th>
                  <th>Сотрудник</th>
                  <th>Статус</th>
                  <th>Назначено</th>
                  <th>Завершено</th>
                  <th>Время</th>
                  <th>Балл</th>
                  <th>Попыток</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td className="an-unit-cell" title={s.unitTitle}>{s.unitTitle}</td>
                    <td><span className="an-direction-badge">{s.direction}</span></td>
                    <td>{s.employeeName}</td>
                    <td><span className={statusClass(s.status)}>{statusLabel(s.status)}</span></td>
                    <td>{s.assignedDate ? formatDate(new Date(s.assignedDate)) : '—'}</td>
                    <td>{s.endDate ? formatDate(new Date(s.endDate)) : '—'}</td>
                    <td>{fmtTime(s.activeTimeMinutes)}</td>
                    <td>{s.score ?? '—'}</td>
                    <td>{s.attempts || 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <h2>Нет данных</h2>
          <p>Попробуйте изменить фильтры или <Button view="text" size={40} onClick={reset}>сбросить</Button></p>
        </div>
      )}
    </section>
  )
}
