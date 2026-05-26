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

function fmtClock(iso) {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

/** «Сегодня, в 14:32» / «Вчера, в 22:15» / «13 мая, в 10:00» */
function fmtRelative(iso) {
  const d = new Date(iso)
  const now = new Date()
  const y = new Date(); y.setDate(now.getDate() - 1)
  const time = fmtClock(iso)
  if (isSameDay(d, now)) return `Сегодня, в ${time}`
  if (isSameDay(d, y)) return `Вчера, в ${time}`
  const day = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  return `${day}, в ${time}`
}

function fmtGroupHead(iso) {
  const d = new Date(iso)
  const now = new Date()
  const y = new Date(); y.setDate(now.getDate() - 1)
  if (isSameDay(d, now)) return 'Сегодня'
  if (isSameDay(d, y)) return 'Вчера'
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function dateKey(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function AuditLogsList({ logs }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [period, setPeriod] = useState('7')

  const categoryOptions = useMemo(() => [
    { key: 'all', content: 'Все действия' },
    ...LOG_CATEGORIES.map((c) => ({ key: c.id, content: c.label })),
  ], [])

  // Уникальные USERID из логов для фильтра «по пользователям»
  const userOptions = useMemo(() => {
    const ids = new Set((logs || []).map((l) => l.userId))
    return [
      { key: 'all', content: 'Все пользователи' },
      ...[...ids].sort().map((id) => ({ key: id, content: id })),
    ]
  }, [logs])
  const [userFilter, setUserFilter] = useState('all')

  const filtered = useMemo(() => {
    let list = logs || []
    if (period !== 'all') {
      const days = Number(period)
      const cutoff = Date.now() - days * 24 * 3600 * 1000
      list = list.filter((l) => new Date(l.timestamp).getTime() >= cutoff)
    }
    if (category !== 'all') list = list.filter((l) => l.category === category)
    if (userFilter !== 'all') list = list.filter((l) => l.userId === userFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((l) =>
        l.userId.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      )
    }
    return list
  }, [logs, search, category, period, userFilter])

  const grouped = useMemo(() => {
    const map = new Map()
    filtered.forEach((l) => {
      const k = dateKey(l.timestamp)
      if (!map.has(k)) map.set(k, [])
      map.get(k).push(l)
    })
    return [...map.entries()].sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
  }, [filtered])

  return (
    <div className="aulog">
      {/* Header: Title + filters */}
      <div className="aulog-header">
        <h2 className="aulog-header__title">Журнал аудита</h2>
        <div className="aulog-header__filters">
          <div className="aulog-filter">
            <span className="aulog-filter__label">Фильтр по пользователям</span>
            <Select
              size={40}
              options={userOptions}
              selected={userOptions.find((o) => o.key === userFilter)}
              onChange={({ selected }) => selected && setUserFilter(selected.key)}
              optionsListWidth="content"
              style={{ minWidth: 220 }}
            />
          </div>
          <div className="aulog-filter">
            <span className="aulog-filter__label">Фильтр по действиям</span>
            <Select
              size={40}
              options={categoryOptions}
              selected={categoryOptions.find((o) => o.key === category)}
              onChange={({ selected }) => selected && setCategory(selected.key)}
              optionsListWidth="content"
              style={{ minWidth: 200 }}
            />
          </div>
          <div className="aulog-filter">
            <span className="aulog-filter__label">Период</span>
            <Select
              size={40}
              options={PERIOD_OPTIONS}
              selected={PERIOD_OPTIONS.find((o) => o.key === period)}
              onChange={({ selected }) => selected && setPeriod(selected.key)}
              optionsListWidth="content"
              style={{ minWidth: 200 }}
            />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="aulog-search">
        <Input
          size={40}
          placeholder="Поиск по USERID или тексту действия..."
          value={search}
          onChange={(_, { value }) => setSearch(value)}
          clear
          block
        />
        <span className="aulog-search__count">
          {filtered.length === 0 ? 'Нет записей' :
            filtered.length === 1 ? '1 запись' :
              filtered.length < 5 ? `${filtered.length} записи` :
                `${filtered.length} записей`}
        </span>
      </div>

      {/* Feed */}
      {grouped.length === 0 ? (
        <div className="aulog-empty">
          <div className="aulog-empty__icon">📋</div>
          <div className="aulog-empty__title">Записей не найдено</div>
          <div className="aulog-empty__desc">Попробуйте изменить фильтры или расширить период.</div>
        </div>
      ) : (
        <div className="aulog-feed">
          {grouped.map(([dk, items]) => (
            <div key={dk} className="aulog-group">
              <div className="aulog-group__head">
                <span className="aulog-group__line" />
                <span className="aulog-group__label">{fmtGroupHead(items[0].timestamp)}</span>
                <span className="aulog-group__line" />
              </div>
              <div className="aulog-list">
                {items.map((l) => {
                  const cat = getLogCategory(l.category)
                  return (
                    <div
                      key={l.id}
                      className="aulog-item"
                      style={{
                        '--cat-color': cat.color,
                        '--cat-bg': cat.bgColor,
                      }}
                    >
                      <div className="aulog-item__icon">
                        <span className="aulog-item__icon-glyph">{cat.icon}</span>
                      </div>
                      <div className="aulog-item__body">
                        <div className="aulog-item__line">
                          <code className="aulog-item__userid">{l.userId}</code>
                          <span className="aulog-item__action">{l.description}</span>
                        </div>
                        <div className="aulog-item__meta">{fmtRelative(l.timestamp)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
