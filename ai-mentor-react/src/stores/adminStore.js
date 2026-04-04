import { create } from 'zustand'

export const useAdminStore = create((set) => ({
  searchText: '',
  // { type: 'role'|'revoke', userId, fullName, newRole?, prevRole?, prevSelectEl? }
  pendingAction: null,

  setSearch(text) {
    set({ searchText: text })
  },

  openConfirm(action) {
    set({ pendingAction: action })
  },

  closeConfirm() {
    set({ pendingAction: null })
  },
}))
