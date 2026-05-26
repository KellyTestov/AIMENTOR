import { create } from 'zustand'
import { PERMISSION_MATRIX } from '../core/constants.js'

const STORAGE_KEY = 'ai-mentor-permission-matrix-v1'

function loadMatrix() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed
  } catch { return null }
}

function persistMatrix(matrix) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(matrix)) } catch {}
}

/**
 * Стор кастомной матрицы прав. По умолчанию равна базовой PERMISSION_MATRIX,
 * пользователь L6 может изменять любую ячейку — сохраняется в localStorage.
 */
export const useMatrixStore = create((set, get) => ({
  matrix: loadMatrix() || PERMISSION_MATRIX,

  togglePermission(permId, level) {
    const next = get().matrix.map((row) => {
      if (row.id !== permId) return row
      const perLevel = [...row.perLevel]
      perLevel[level] = !perLevel[level]
      return { ...row, perLevel }
    })
    persistMatrix(next)
    set({ matrix: next })
  },

  setPermission(permId, level, value) {
    const next = get().matrix.map((row) => {
      if (row.id !== permId) return row
      const perLevel = [...row.perLevel]
      perLevel[level] = !!value
      return { ...row, perLevel }
    })
    persistMatrix(next)
    set({ matrix: next })
  },

  reset() {
    persistMatrix(PERMISSION_MATRIX)
    set({ matrix: PERMISSION_MATRIX })
  },
}))
