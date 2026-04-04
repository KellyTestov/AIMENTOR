import { create } from 'zustand'

const BUILDER_KEY = 'ai-mentor-builder-data-v1'
const SESSION_KEY = 'ai-mentor-sandbox-session-v1'

const MOCK_CLIENT = {
  name:     'Иванова Мария Петровна',
  phone:    '+7 (999) 123-45-67',
  account:  '40817810000000001234',
  status:   'Активный клиент',
  products: ['Дебетовая карта Альфа-Карта', 'Накопительный счёт'],
  request:  'Вопрос по комиссии за уведомления по дебетовой карте',
}

const MOCK_CORRECT = [
  '✅ Верно! Ваш ответ соответствует стандарту обслуживания.',
  '✅ Хорошо! Ответ точный и полный.',
  '✅ Отлично! Именно так нужно отвечать клиенту.',
]
const MOCK_HINTS = [
  '💡 Подсказка: уточните тип карты клиента — тарифы для дебетовых и кредитных карт различаются.',
  '💡 Подсказка: проверьте информацию в разделе A-Book «Комиссии и тарифы».',
  '💡 Подсказка: предложите клиенту уточняющий вопрос для выявления его потребности.',
]

export function flattenQuestions(unit) {
  const list = []
  function walk(node) {
    if (node.type === 'question') list.push(node)
    ;(node.children || []).forEach(walk)
  }
  ;(unit.children || []).forEach(walk)
  return list
}

export function getNodeHtml(unit, type) {
  const node = (unit.children || []).find(c => c.type === type)
  if (!node) return null
  const els = ((node.content && node.content.elements) || []).filter(el => el.text && el.text.trim())
  if (!els.length) return null
  return els.map(el =>
    el.heading
      ? `<p><strong>${el.heading}</strong></p><p>${el.text}</p>`
      : `<p>${el.text}</p>`
  ).join('')
}

export function findParentCase(unit, questionNode) {
  function search(node) {
    if (!node.children) return null
    for (const child of node.children) {
      if (child.id === questionNode.id) return node
      const found = search(child)
      if (found) return found
    }
    return null
  }
  return search(unit)
}

function saveSession(session) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)) } catch {}
}
function loadSavedSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}
function clearSession() { localStorage.removeItem(SESSION_KEY) }

export { MOCK_CLIENT, MOCK_CORRECT, MOCK_HINTS, saveSession, loadSavedSession, clearSession }

let _msgId = 0
function nextId() { return ++_msgId }

export const useSandboxStore = create((set, get) => ({
  unit:              null,
  session:           null,
  messages:          [],
  isBusy:            false,
  elapsed:           0,
  questionElapsed:   0,
  phase:             'idle',   // idle | rules | resume | running | done | error
  error:             null,
  client:            MOCK_CLIENT,

  loadUnit(id) {
    try {
      const all  = JSON.parse(localStorage.getItem(BUILDER_KEY) || '{}')
      const unit = all[id] || null
      if (!unit) {
        set({ error: `Обучение с ID «${id}» не найдено.`, phase: 'error' })
        return
      }

      // Check saved session
      const saved = loadSavedSession()
      if (saved && saved.unitId === id) {
        set({ unit, session: saved, messages: saved.messages || [], elapsed: saved.elapsedSeconds || 0 })
        if (saved.phase === 'done') {
          set({ phase: 'done' })
        } else if (unit.type !== 'trainer' && saved.phase === 'running') {
          set({ phase: 'resume' })
        } else {
          // trainer restore: just continue
          set({ phase: 'running' })
        }
      } else {
        const session = {
          unitId: id,
          phase: 'greeting',
          questionIndex: 0,
          messages: [],
          errors: [],
          elapsedSeconds: 0,
          errorOccurred: false,
        }
        saveSession(session)
        set({ unit, session, messages: [], elapsed: 0, phase: unit.type !== 'trainer' ? 'rules' : 'idle' })
      }
    } catch {
      set({ error: 'Ошибка загрузки обучения.', phase: 'error' })
    }
  },

  addMessage(role, html) {
    const msg = { id: nextId(), role, html }
    set(s => {
      const messages = [...s.messages, msg]
      const session  = s.session ? { ...s.session, messages } : s.session
      if (session) saveSession(session)
      return { messages, session }
    })
    return msg
  },

  setBusy(isBusy) { set({ isBusy }) },

  updateSession(patch) {
    set(s => {
      const session = { ...s.session, ...patch }
      saveSession(session)
      return { session, phase: patch.phase || s.phase }
    })
  },

  setPhase(phase) { set({ phase }) },
  setError(error) { set({ error, phase: 'error' }) },
  tickElapsed() {
    set(s => {
      const elapsed  = s.elapsed + 1
      const session  = s.session ? { ...s.session, elapsedSeconds: elapsed } : s.session
      if (session) saveSession(session)
      return { elapsed, session }
    })
  },
  tickQuestion() { set(s => ({ questionElapsed: s.questionElapsed + 1 })) },
  resetQuestionTimer() { set({ questionElapsed: 0 }) },

  clearSession() {
    clearSession()
    set({ session: null, messages: [], elapsed: 0, questionElapsed: 0, phase: 'idle' })
  },

  publishUnit() {
    const { unit } = get()
    if (!unit) return
    try {
      const all = JSON.parse(localStorage.getItem(BUILDER_KEY) || '{}')
      if (all[unit.id]) {
        all[unit.id].publicationStatus = 'published'
        all[unit.id].updatedAt = new Date().toISOString()
        localStorage.setItem(BUILDER_KEY, JSON.stringify(all))
      }
    } catch {}
  },
}))
