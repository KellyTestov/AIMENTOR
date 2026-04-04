import { create } from 'zustand'

export const useAppStore = create((set) => ({
  currentUser: null,
  units: [],
  analyticsSessions: [],
  accessUsers: [],

  init({ currentUser, units, analyticsSessions, accessUsers }) {
    set({ currentUser, units, analyticsSessions, accessUsers })
  },

  addUnit(unit) {
    set((s) => ({ units: [...s.units, unit] }))
  },

  updateUnit(id, patch) {
    set((s) => ({
      units: s.units.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    }))
  },

  deleteUnit(id) {
    set((s) => ({ units: s.units.filter((u) => u.id !== id) }))
  },

  setAccessUsers(accessUsers) {
    set({ accessUsers })
  },
}))
