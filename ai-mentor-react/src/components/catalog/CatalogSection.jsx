import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../stores/appStore.js'
import { useCatalogStore } from '../../stores/catalogStore.js'
import { DIRECTION_MAP, ALL_DIRECTIONS, UNIT_CATEGORIES, FACTORIES } from '../../core/constants.js'
import { storage } from '../../core/storage.js'
import { STORAGE_KEYS } from '../../core/constants.js'
import FilterDropdown from './FilterDropdown.jsx'
import SortDropdown from './SortDropdown.jsx'
import UnitCard from './UnitCard.jsx'
import ConfirmModal from '../shared/ConfirmModal.jsx'

export default function CatalogSection({ onOpenWizard }) {
  const navigate = useNavigate()
  const units = useAppStore((s) => s.units)
  const currentUser = useAppStore((s) => s.currentUser)
  const deleteUnit = useAppStore((s) => s.deleteUnit)
  const updateUnit = useAppStore((s) => s.updateUnit)

  const filters = useCatalogStore()
  const setFilter = useCatalogStore((s) => s.setFilter)
  const reset = useCatalogStore((s) => s.reset)
  const isDefault = useCatalogStore((s) => s.isDefault)

  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  // Список единиц с учётом прав
  const visibleUnits = useMemo(() => {
    const rights = currentUser?.rights || {}
    if (rights.isAdmin) return units
    if (rights.allowedUnitIds?.length) return units.filter((u) => rights.allowedUnitIds.includes(u.id))
    return units
  }, [units, currentUser])

  // Доступные типы и фабрики из данных
  const unitTypes = useMemo(() => [...new Set(visibleUnits.map((u) => u.type).filter(Boolean))], [visibleUnits])
  const unitFactories = useMemo(() => FACTORIES.filter((f) => visibleUnits.some((u) => u.factory === f)), [visibleUnits])

  // Направления — зависят от выбранных фабрик
  const availableDirections = useMemo(() => {
    const selectedFactories = filters.factory === 'all' ? [] : Array.isArray(filters.factory) ? filters.factory : [filters.factory]
    if (selectedFactories.length === 0) return ALL_DIRECTIONS
    return [...new Set(selectedFactories.flatMap((f) => DIRECTION_MAP[f] || []))]
  }, [filters.factory])

  // Применяем фильтры
  const filtered = useMemo(() => {
    let list = visibleUnits

    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter((u) => u.title.toLowerCase().includes(q))
    }
    if (filters.type !== 'all') {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type]
      list = list.filter((u) => types.includes(u.type))
    }
    if (filters.category !== 'all') {
      const cats = Array.isArray(filters.category) ? filters.category : [filters.category]
      list = list.filter((u) => cats.includes(u.category))
    }
    if (filters.factory !== 'all') {
      const facs = Array.isArray(filters.factory) ? filters.factory : [filters.factory]
      list = list.filter((u) => facs.includes(u.factory))
    }
    if (filters.direction !== 'all') {
      const dirs = Array.isArray(filters.direction) ? filters.direction : [filters.direction]
      list = list.filter((u) => dirs.includes(u.direction))
    }

    // Сортировка
    list = [...list]
    if (filters.sort === 'updated_desc') list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    else if (filters.sort === 'created_desc') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    else if (filters.sort === 'name_asc') list.sort((a, b) => a.title.localeCompare(b.title, 'ru'))

    return list
  }, [visibleUnits, filters])

  function handleAction(type, unit) {
    if (type === 'open') {
      // Builder units (in localStorage) → React sandbox; mock units → external launchUrl
      const all = storage.getObject(STORAGE_KEYS.BUILDER_DATA, {})
      if (all[unit.id]) {
        navigate(`/sandbox?id=${unit.id}`)
      } else {
        window.open(unit.launchUrl, '_blank', 'noopener,noreferrer')
      }
    } else if (type === 'edit') {
      ensureBuilderData(unit)
      sessionStorage.setItem('bld-pending-id', unit.id)
      navigate(`/builder?id=${unit.id}`)
    } else if (type === 'toggle-publicity') {
      const next = unit.publicationStatus === 'published' ? 'private' : 'published'
      updateUnit(unit.id, { publicationStatus: next })
      // Обновляем localStorage для builder
      const all = storage.getObject(STORAGE_KEYS.BUILDER_DATA, {})
      if (all[unit.id]) {
        all[unit.id].publicationStatus = next
        storage.setObject(STORAGE_KEYS.BUILDER_DATA, all)
      }
    } else if (type === 'delete') {
      setPendingDeleteId(unit.id)
    }
  }

  function confirmDelete() {
    if (!pendingDeleteId) return
    deleteUnit(pendingDeleteId)
    const all = storage.getObject(STORAGE_KEYS.BUILDER_DATA, {})
    delete all[pendingDeleteId]
    storage.setObject(STORAGE_KEYS.BUILDER_DATA, all)
    setPendingDeleteId(null)
  }

  function ensureBuilderData(unit) {
    const all = storage.getObject(STORAGE_KEYS.BUILDER_DATA, {})
    if (!all[unit.id]) {
      all[unit.id] = {
        id: unit.id, title: unit.title,
        type: unit.type === 'Обучающая' ? 'trainer' : 'exam',
        category: unit.category || '', factory: unit.factory || '',
        durationLabel: unit.durationLabel || '',
        publicationStatus: unit.publicationStatus || 'private',
        coverDataUrl: unit.coverUrl || null,
        createdAt: unit.createdAt || new Date().toISOString(),
        _isNew: true,
      }
      storage.setObject(STORAGE_KEYS.BUILDER_DATA, all)
    }
  }

  const pendingUnit = units.find((u) => u.id === pendingDeleteId)

  return (
    <section className="section section--catalog" aria-label="Каталог обучения">
      {/* Тулбар */}
      <div className="catalog-toolbar">
        <div className="toolbar-search">
          <label>
            <span className="sr-only">Поиск</span>
            <div className="toolbar-search__wrap">
              <svg className="toolbar-search__icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="search"
                placeholder="По названию обучения"
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                aria-label="Поиск по названию"
              />
            </div>
          </label>
        </div>

        <div className="toolbar-controls">
          <FilterDropdown
            label="Тип"
            options={unitTypes}
            value={filters.type}
            onChange={(v) => setFilter('type', v)}
          />
          <FilterDropdown
            label="Категория"
            options={UNIT_CATEGORIES}
            value={filters.category}
            onChange={(v) => setFilter('category', v)}
          />
          <FilterDropdown
            label="Фабрика"
            options={unitFactories}
            value={filters.factory}
            onChange={(v) => setFilter('factory', v)}
          />
          <FilterDropdown
            label="Направление"
            options={availableDirections}
            value={filters.direction}
            onChange={(v) => setFilter('direction', v)}
          />
          <SortDropdown value={filters.sort} onChange={(v) => setFilter('sort', v)} />
          {!isDefault() && (
            <button className="btn btn--ghost" id="reset-filters" onClick={reset} type="button">
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Сетка */}
      {filtered.length > 0 ? (
        <div className="catalog-grid" aria-live="polite" aria-label="Единицы обучения">
          {filtered.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              currentUser={currentUser}
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state" aria-live="polite">
          <h2>Нет доступных единиц обучения</h2>
          <p>Каталог пока пуст для вашей роли.</p>
        </div>
      )}

      {/* Модал удаления */}
      <ConfirmModal
        open={!!pendingDeleteId}
        title="Удалить единицу обучения?"
        description={pendingUnit ? `Единица <strong>${pendingUnit.title}</strong> будет удалена без возможности восстановления.` : ''}
        confirmLabel="Удалить"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </section>
  )
}
