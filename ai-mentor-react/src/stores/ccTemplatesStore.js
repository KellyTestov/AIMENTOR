import { create } from 'zustand'

const STORAGE_KEY = 'ai-mentor-cc-templates-v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function persist(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
}

let _seq = Date.now()
function genId(pfx) { return `${pfx}-${++_seq}` }

/**
 * Стор кастомных шаблонов карточки клиента (созданных через админку BL).
 * Структура шаблона совпадает с базовыми из clientCardTemplates.js:
 *   { id, name, description, icon, businessLine, sections: [{ id, title, collapsible, fields: [{ id, label, placeholder }] }] }
 */
export const useCcTemplatesStore = create((set, get) => ({
  templates: load(),

  /** Все шаблоны указанной BL (для конструктора и для админки). */
  forBl(blId) {
    return get().templates.filter((t) => t.businessLine === blId)
  },

  add(template) {
    const tpl = {
      id: template.id || genId('cct'),
      name: template.name || 'Новый шаблон',
      description: template.description || '',
      icon: template.icon || '📋',
      businessLine: template.businessLine,
      sections: template.sections || [],
    }
    const next = [...get().templates, tpl]
    persist(next); set({ templates: next })
    return tpl
  },

  update(id, patch) {
    const next = get().templates.map((t) => t.id === id ? { ...t, ...patch } : t)
    persist(next); set({ templates: next })
  },

  remove(id) {
    const next = get().templates.filter((t) => t.id !== id)
    persist(next); set({ templates: next })
  },
}))

export { genId as genTemplateId }
