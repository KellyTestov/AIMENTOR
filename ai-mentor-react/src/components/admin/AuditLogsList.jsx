import { useState, useMemo } from 'react'
import { Input } from '@alfalab/core-components/input/esm'
import { Select } from '@alfalab/core-components/select/esm'
import { LOG_CATEGORIES, getLogCategory } from '../../shared/mock/auditLogs.js'

const PERIOD_OPTIONS = [
  { key: '1',  content: 'Последние 24 часа' },
  { key: '3',  content: 'Последние 3 дня' },
  { key: '7',  content: 'Последние 7 дней' },
  { key: '30', content: 'Последние 30 дней' },
  { key: 'all', content: 'За всё время' },
]

function pad(n) { return n < 10 ? `0${n}` : `${n}` }

function fmtTime(iso) {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fmtDateHeader(iso) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (isSameDay(d, today)) return 'Сегодня'
  if (isSameDay(d, yesterday)) return 'Вчера'
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function dateKey(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * Таблица логов с фильтрами и группировкой по датам.
 *
 * Props:
 *   logs: array
 */
export default function AuditLogsList({ logs }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [period, setPeriod] = useState('7')

  const categoryOptions = useMemo(() => [
    { key: 'all', content: 'Все типы действий' },
    ...LOG_CATEGORIES.map((c) => ({ key: c.id, content: c.label })),
  ], [])

  const filtered = useMemo(() => {
    let list = logs || []

    // Period filter
    if (period !== 'all') {
      const days = Number(period)
      const cutoff = Date.now() - days * 24 * 3600 * 1000
      list = list.filter((l) => new Date(l.timestamp).getTime() >= cutoff)
    }

    // Category filter
    if (category !== 'all') {
      list = list.filter((l) => l.category === category)
    }

    // Search by USERID
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((l) =>
        l.userId.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      )
    }

    return list
  }, [logs, search, category, period])

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map()
    filtered.forEach((l) => {
      const k = dateKey(l.timestamp)
      if (!map.has(k)) map.set(k, [])
      map.get(k).push(l)
    })
    // Sorted by key descending (newest date first)
    return [...map.entries()].sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
  }, [filtered])

  return (
    <div className="logs">
      {/* Toolbar */}
      <div className="logs-toolbar">
        <Input
          size={40}
          placeholder="Поиск по USERID или тексту действия..."
          value={search}
          onChange={(_, { value }) => setSearch(value)}
          clear
          style={{ width: 360 }}
        />
        <Select
          size={40}
          options={categoryOptions}
          selected={categoryOptions.find((o) => o.key === category)}
          onChange={({ selected }) => selected && setCategory(selected.key)}
          optionsListWidth="content"
          style={{ minWidth: 200 }}
        />
        <Select
          size={40}
          options={PERIOD_OPTIONS}
          selected={PERIOD_OPTIONS.find((o) => o.key === period)}
          onChange={({ selected }) => selected && setPeriod(selected.key)}
          optionsListWidth="content"
          style={{ minWidth: 180 }}
        />
        <div style={{ flex: 1 }} />
        <span className="logs-toolbar__count">
          {filtered.length === 0 ? 'Нет записей' :
            filtered.length === 1 ? '1 запись' :
              filtered.length < 5 ? `${filtered.length} записи` :
                `${filtered.length} записей`}
        </span>
      </div>

      {/* Empty state */}
      {grouped.length === 0 ? (
        <div className="logs-empty">
          <div className="logs-empty__icon">📋</div>
          <div className="logs-empty__title">Записей не найдено</div>
          <div className="logs-empty__desc">Попробуйте изменить фильтры или расширить период.</div>
        </div>
      ) : (
        <div className="logs-table-wrap">
          {grouped.map(([dk, items]) => (
            <div key={dk} className="logs-group">
              <div className="logs-group__head">{fmtDateHeader(items[0].timestamp)}</div>
              <table className="logs-table">
                <colgroup>
                  <col style={{ width: 80 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 130 }} />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th>Время</th>
                    <th>USERID</th>
                    <th>Тип</th>
                    <th>Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((l) => {
                    const cat = getLogCategory(l.category)
                    return (
                      <tr key={l.id}>
                        <td className="logs-time">{fmtTime(l.timestamp)}</td>
                        <td><code>{l.userId}</code></td>
                        <td>
                          <span
                            className="logs-chip"
                            style={{ '--cat-color': cat.color, '--cat-bg': cat.bgColor }}
                          >
                            {cat.label}
                          </span>
                        </td>
                        <td className="logs-action">{l.description}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
