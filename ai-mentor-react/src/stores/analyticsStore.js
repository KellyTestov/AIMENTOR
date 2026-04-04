import { create } from 'zustand'

const DEFAULT_STATE = {
  period: 'month',
  customFrom: '',
  customTo: '',
  status: 'all',
  factories: [],
  directions: [],
  unitSearch: '',
  sortByPopularity: false,
  selectedEmployeeId: null,
  employeeSearchText: '',
}

export const useAnalyticsStore = create((set) => ({
  ...DEFAULT_STATE,

  setFilter(key, value) {
    set({ [key]: value })
  },

  reset() {
    set(DEFAULT_STATE)
  },
}))
