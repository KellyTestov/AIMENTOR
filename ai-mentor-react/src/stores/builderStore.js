import { create } from 'zustand'
import { builderService } from '../builderServices/builderService.js'

const ICONS = {
  unit:         '📋',
  onboarding:   '🚀',
  theory_block: '📚',
  theory:       '📄',
  practice:     '🎯',
  section:      '📁',
  case:         '💼',
  question:     '❓',
  completion:   '🏁',
}

const CHILD_TYPES = {
  unit:         'practice',
  theory_block: 'theory',
  practice:     'section',
  section:      'case',
  case:         'question',
}

const CHILD_TITLES = {
  practice: 'Практический блок',
  theory:   'Теория',
  section:  'Раздел',
  case:     'Кейс',
  question: 'Вопрос',
}

let _seq = Date.now()
function genId(pfx) { return `${pfx || 'n'}-${++_seq}` }

function makeNode(type, title, children = [], content = {}) {
  return { id: genId(type), type, title, children, content, settings: {} }
}

function buildScaffold(meta) {
  const isTrainer = meta.type === 'trainer'

  const u = {
    id:               meta.id,
    title:            meta.title,
    type:             meta.type,
    description:      meta.description      || '',
    category:         meta.category         || '',
    factory:          meta.factory          || '',
    topic:            meta.topic            || '',
    direction:        meta.direction        || '',
    durationLabel:    meta.durationLabel     || '',
    coverDataUrl:     meta.coverDataUrl      || null,
    publicationStatus: 'private',
    createdAt:        meta.createdAt || new Date().toISOString(),
    updatedAt:        new Date().toISOString(),
    settings: {
      failPolicy:       'retry',
      tov:              'neutral',
      ahtTarget:        120,
      silenceThreshold: 10,
      hintPolicy:       'on_request',
      defaultFeedback:  'text',
    },
    children: [],
  }

  u.children.push(makeNode('onboarding', 'Онбординг', [], {
    elements: [{ id: genId('el'), heading: '', text: '' }]
  }))

  if (isTrainer) {
    const q1    = makeNode('question', 'Вопрос 1',  [], { text: '', criteria: [], hints: [], feedback: '' })
    const case1 = makeNode('case',     'Кейс 1',    [q1],    { description: '', clientCard: {} })
    const sec1  = makeNode('section',  'Раздел 1',  [case1], {})
    const prac  = makeNode('practice', 'Практический блок', [sec1], {})
    const th1   = makeNode('theory',   'Теория 1',  [], { elements: [{ id: genId('el'), heading: '', text: '' }] })
    const tBlock = makeNode('theory_block', 'Теоретический блок', [th1], {})
    u.children.push(tBlock)
    u.children.push(prac)
  } else {
    const mkQ = () => makeNode('question', 'Вопрос 1', [], { text: '', criteria: [], hints: [], feedback: '' })
    const mkC = (q) => makeNode('case',    'Кейс 1',   [q], { description: '', clientCard: {} })
    const s1  = makeNode('section', 'Раздел 1', [mkC(mkQ())], {})
    const s2  = makeNode('section', 'Раздел 2', [mkC(mkQ())], {})
    const prac = makeNode('practice', 'Практический блок', [s1, s2], {})
    u.children.push(prac)
  }

  u.children.push(makeNode('completion', 'Завершение', [], { elements: [] }))
  return u
}

export { ICONS, CHILD_TYPES, makeNode, genId }

export const useBuilderStore = create((set, get) => ({
  unit: null,
  selectedId: null,
  isDirty: false,
  error: null,

  load(unitId) {
    try {
      let stored = builderService.loadUnit(unitId)
      if (!stored) {
        set({ error: `Обучение с ID «${unitId}» не найдено.` })
        return
      }
      // Bootstrap scaffold if _isNew
      if (stored._isNew) {
        stored = buildScaffold(stored)
        builderService.saveUnit(stored)
      }
      // Ensure settings exist
      if (!stored.settings) {
        stored.settings = {
          failPolicy: 'retry', tov: 'neutral', ahtTarget: 120,
          silenceThreshold: 10, hintPolicy: 'on_request', defaultFeedback: 'text',
        }
      }
      set({ unit: stored, selectedId: stored.id, isDirty: false, error: null })
    } catch {
      set({ error: 'Ошибка загрузки обучения.' })
    }
  },

  selectNode(id) {
    set({ selectedId: id })
  },

  updateUnit(patch) {
    const { unit } = get()
    if (!unit) return
    const updated = { ...unit, ...patch }
    builderService.saveUnit(updated)
    set({ unit: updated, isDirty: true })
  },

  updateNode(nodeId, patch) {
    const { unit } = get()
    if (!unit) return
    const updated = JSON.parse(JSON.stringify(unit))
    if (nodeId === updated.id) {
      Object.assign(updated, patch)
    } else {
      const node = builderService.findNode(updated, nodeId)
      if (node) Object.assign(node, patch)
    }
    builderService.saveUnit(updated)
    set({ unit: updated, isDirty: true })
  },

  updateNodeContent(nodeId, contentPatch) {
    const { unit } = get()
    if (!unit) return
    const updated = JSON.parse(JSON.stringify(unit))
    const node = builderService.findNode(updated, nodeId)
    if (node) {
      node.content = { ...(node.content || {}), ...contentPatch }
    }
    builderService.saveUnit(updated)
    set({ unit: updated, isDirty: true })
  },

  updateNodeFull(nodeId, contentFull) {
    const { unit } = get()
    if (!unit) return
    const updated = JSON.parse(JSON.stringify(unit))
    const node = builderService.findNode(updated, nodeId)
    if (node) {
      node.content = contentFull
    }
    builderService.saveUnit(updated)
    set({ unit: updated, isDirty: true })
  },

  addChild(parentId) {
    const { unit } = get()
    if (!unit) return null
    const updated = JSON.parse(JSON.stringify(unit))
    const parent = parentId === updated.id ? updated : builderService.findNode(updated, parentId)
    if (!parent) return null
    const childType = CHILD_TYPES[parent.type]
    if (!childType) return null
    const count = (parent.children || []).filter(c => c.type === childType).length
    const title = `${CHILD_TITLES[childType] || childType} ${count + 1}`
    const child = makeNode(childType, title, [], {})
    if (!parent.children) parent.children = []
    parent.children.push(child)
    builderService.saveUnit(updated)
    set({ unit: updated, selectedId: child.id, isDirty: true })
    return child.id
  },

  deleteNode(nodeId) {
    const { unit } = get()
    if (!unit) return
    const updated = JSON.parse(JSON.stringify(unit))
    builderService.removeNode(updated, nodeId)
    builderService.saveUnit(updated)
    set({ unit: updated, selectedId: updated.id, isDirty: true })
  },

  duplicateNode(nodeId) {
    const { unit } = get()
    if (!unit) return
    const updated = JSON.parse(JSON.stringify(unit))
    const original = builderService.findNode(updated, nodeId)
    if (!original) return
    const parent = builderService.findParent(updated, nodeId)
    if (!parent) return
    const clone = JSON.parse(JSON.stringify(original))
    // Regen IDs
    function regenIds(node) {
      node.id = genId(node.type)
      ;(node.children || []).forEach(regenIds)
    }
    regenIds(clone)
    clone.title = clone.title + ' (копия)'
    const idx = parent.children.findIndex(c => c.id === nodeId)
    parent.children.splice(idx + 1, 0, clone)
    builderService.saveUnit(updated)
    set({ unit: updated, selectedId: clone.id, isDirty: true })
  },

  reorderChildren(parentId, fromIdx, toIdx) {
    const { unit } = get()
    if (!unit) return
    const updated = JSON.parse(JSON.stringify(unit))
    const parent = parentId === updated.id ? updated : builderService.findNode(updated, parentId)
    if (!parent || !parent.children) return
    const [moved] = parent.children.splice(fromIdx, 1)
    parent.children.splice(toIdx, 0, moved)
    builderService.saveUnit(updated)
    set({ unit: updated, isDirty: true })
  },

  addTopBlock() {
    const { unit } = get()
    if (!unit) return
    const updated = JSON.parse(JSON.stringify(unit))
    const q    = makeNode('question', 'Вопрос 1',  [], { text: '', criteria: [], hints: [], feedback: '' })
    const case1 = makeNode('case',   'Кейс 1',    [q],    { description: '', clientCard: {} })
    const sec1  = makeNode('section', 'Раздел 1', [case1], {})
    const count = (updated.children || []).filter(c => c.type === 'practice').length
    const prac  = makeNode('practice', `Практический блок ${count + 1}`, [sec1], {})
    const completionIdx = updated.children.findIndex(c => c.type === 'completion')
    if (completionIdx !== -1) {
      updated.children.splice(completionIdx, 0, prac)
    } else {
      updated.children.push(prac)
    }
    builderService.saveUnit(updated)
    set({ unit: updated, selectedId: prac.id, isDirty: true })
  },

  publish() {
    const { unit } = get()
    if (!unit) return
    const updated = { ...unit, publicationStatus: 'published', updatedAt: new Date().toISOString() }
    builderService.saveUnit(updated)
    set({ unit: updated, isDirty: false })
  },

  save() {
    const { unit } = get()
    if (!unit) return
    builderService.saveUnit(unit)
    set({ isDirty: false })
  },

  setDirty(val) {
    set({ isDirty: val })
  },
}))
