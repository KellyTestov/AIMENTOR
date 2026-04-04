import { create } from 'zustand'
import { storage } from '../core/storage.js'
import { STORAGE_KEYS } from '../core/constants.js'

const DEFAULT_STATE = {
  search: '',
  type: 'all',
  category: 'all',
  factory: 'all',
  direction: 'all',
  sort: 'updated_desc',
}

function loadPersistedState() {
  try {
    return storage.getObject(STORAGE_KEYS.CATALOG_STATE, DEFAULT_STATE)
  } catch {
    return DEFAULT_STATE
  }
}

export const useCatalogStore = create((set, get) => ({
  ...loadPersistedState(),

  setFilter(key, value) {
    const next = { ...get(), [key]: value }
    set(next)
    storage.setObject(STORAGE_KEYS.CATALOG_STATE, {
      search: next.search,
      type: next.type,
      category: next.category,
      factory: next.factory,
      direction: next.direction,
      sort: next.sort,
    })
  },

  reset() {
    set(DEFAULT_STATE)
    storage.setObject(STORAGE_KEYS.CATALOG_STATE, DEFAULT_STATE)
  },

  isDefault() {
    const s = get()
    return (
      s.search === DEFAULT_STATE.search &&
      s.type === DEFAULT_STATE.type &&
      s.category === DEFAULT_STATE.category &&
      s.factory === DEFAULT_STATE.factory &&
      s.direction === DEFAULT_STATE.direction &&
      s.sort === DEFAULT_STATE.sort
    )
  },
}))
