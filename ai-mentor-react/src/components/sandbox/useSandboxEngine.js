/**
 * useSandboxEngine — hook that drives the trainer/exam conversation logic.
 * Returns { handleInput } to be called when user sends a message.
 */
import { useCallback } from 'react'
import {
  useSandboxStore,
  flattenQuestions,
  getNodeHtml,
  findParentCase,
  MOCK_CORRECT,
  MOCK_HINTS,
} from '../../stores/sandboxStore.js'

export function useSandboxEngine() {
  const store = useSandboxStore()

  // botSay: add typing indicator → wait → add bot message → unblock
  async function botSay(html, delay = 750) {
    store.setBusy(true)
    store.addMessage('typing', '')  // typing placeholder handled in ChatWindow
    await new Promise(r => setTimeout(r, delay))
    // Remove last typing msg
    useSandboxStore.setState(s => ({ messages: s.messages.filter(m => m.role !== 'typing') }))
    store.addMessage(store.unit?.type === 'exam' ? 'client' : 'bot', html)
    store.setBusy(false)
  }

  // ── TRAINER ────────────────────────────────────────
  async function trainerGreeting() {
    const { unit } = useSandboxStore.getState()
    const obHtml = getNodeHtml(unit, 'onboarding')
    let html = `<p>Добро пожаловать в тестовую среду тренажёра!</p>
<p>Вы проверяете тренажёр <strong>«${unit.title}»</strong>.</p>`
    if (obHtml) html += `<div class="sb-msg__block">${obHtml}</div>`
    html += `<p>Для начала тренировки введите <strong>«Старт»</strong>.</p>`
    await botSay(html, 400)
    store.updateSession({ phase: 'greeting' })
  }

  async function trainerStart() {
    store.updateSession({ phase: 'running', questionIndex: 0, errors: [] })
    await botSay('<p>Начинаем тренировку! Отвечайте на вопросы в формате диалога с клиентом.</p>', 500)
    await trainerAskQuestion()
  }

  async function trainerAskQuestion() {
    const { unit, session } = useSandboxStore.getState()
    const questions = flattenQuestions(unit)
    const idx = session.questionIndex
    if (idx >= questions.length) { await trainerFinish(); return }

    const q      = questions[idx]
    const parent = findParentCase(unit, q)
    let html = ''

    if (parent?.type === 'case' && parent.content?.description?.trim()) {
      html += `<div class="sb-msg__case"><em>Кейс: ${parent.content.description}</em></div>`
    }
    html += `<div class="sb-msg__qnum">Вопрос ${idx + 1} из ${questions.length}</div>`
    html += `<p>${q.content?.text || '(текст вопроса не заполнен)'}</p>`

    const hints = (q.content?.hints || []).filter(h => h?.text?.trim() || (typeof h === 'string' && h.trim()))
    if (hints.length) {
      const hintText = typeof hints[0] === 'string' ? hints[0] : hints[0].text
      html += `<div class="sb-msg__hint">💡 ${hintText}</div>`
    }

    await botSay(html, 600)
  }

  async function trainerHandleAnswer(text) {
    const { unit, session } = useSandboxStore.getState()
    const questions = flattenQuestions(unit)
    const idx = session.questionIndex
    const q   = questions[idx]
    const isError = text.trim().length < 10

    let evalHtml = ''
    if (q.content?.feedback?.trim()) {
      evalHtml = `<p>${q.content.feedback}</p>`
    } else if (isError) {
      const hintIdx = idx % MOCK_HINTS.length
      evalHtml = `<p>⚠️ Ответ можно дополнить.</p><p>${MOCK_HINTS[hintIdx]}</p>`
      const errors = [...(session.errors || []), idx]
      store.updateSession({ errors })
    } else {
      const corrIdx = idx % MOCK_CORRECT.length
      evalHtml = `<p>${MOCK_CORRECT[corrIdx]}</p>`
      if (q.content?.refAnswer?.trim()) {
        evalHtml += `<div class="sb-msg__ref"><span class="sb-msg__ref-label">Эталонный ответ:</span><span>${q.content.refAnswer}</span></div>`
      }
    }

    await botSay(evalHtml, 650)
    store.updateSession({ questionIndex: session.questionIndex + 1 })
    await trainerAskQuestion()
  }

  async function trainerFinish() {
    store.updateSession({ phase: 'done' })
    const { unit } = useSandboxStore.getState()
    const compHtml = getNodeHtml(unit, 'completion')
    let html = '<p>🏁 <strong>Тренировка завершена!</strong></p>'
    if (compHtml) html += `<div class="sb-msg__block">${compHtml}</div>`
    await botSay(html, 600)
    setTimeout(() => store.setPhase('done'), 800)
  }

  // ── EXAM ─────────────────────────────────────────
  async function examAskQuestion() {
    const { unit, session } = useSandboxStore.getState()
    const questions = flattenQuestions(unit)
    const idx = session.questionIndex
    if (idx >= questions.length) { await examFinish(); return }

    const q      = questions[idx]
    const parent = findParentCase(unit, q)
    let html = ''

    if (parent?.type === 'case' && parent.content?.description?.trim()) {
      html += `<div class="sb-msg__case">${parent.content.description}</div>`
    }
    html += `<p>${q.content?.text || '(вопрос не заполнен)'}</p>`

    await botSay(html, 600)
    store.resetQuestionTimer()
  }

  async function examHandleAnswer() {
    const { session } = useSandboxStore.getState()
    store.updateSession({ questionIndex: session.questionIndex + 1 })
    await examAskQuestion()
  }

  async function examFinish() {
    store.updateSession({ phase: 'done' })
    const { unit } = useSandboxStore.getState()
    const compHtml = getNodeHtml(unit, 'completion')
    let html = '<p>✅ <strong>Экзамен завершён.</strong></p>'
    if (compHtml) html += `<div class="sb-msg__block">${compHtml}</div>`
    await botSay(html, 600)
    setTimeout(() => store.setPhase('done'), 800)
  }

  // ── PUBLIC API ────────────────────────────────────
  const handleInput = useCallback(async (text) => {
    const { unit, session, isBusy } = useSandboxStore.getState()
    if (!text.trim() || isBusy) return

    store.addMessage('user', `<p>${text}</p>`)

    if (unit.type === 'trainer') {
      if (session.phase === 'greeting') {
        if (/^старт$/i.test(text.trim())) {
          await trainerStart()
        } else {
          await botSay('<p>Введите <strong>«Старт»</strong>, чтобы начать тренировку.</p>', 350)
        }
      } else if (session.phase === 'running') {
        await trainerHandleAnswer(text)
      }
    } else {
      if (session.phase === 'running') {
        await examHandleAnswer()
      }
    }
  }, [])

  const startTrainer = useCallback(async () => {
    await trainerGreeting()
    store.setBusy(false)
    store.setPhase('running')
  }, [])

  const startExam = useCallback(async () => {
    store.updateSession({ phase: 'running', questionIndex: 0 })
    store.setPhase('running')
    await examAskQuestion()
  }, [])

  const resumeExam = useCallback(async () => {
    store.updateSession({ errorOccurred: false })
    store.setPhase('running')
    await examAskQuestion()
  }, [])

  return { handleInput, startTrainer, startExam, resumeExam }
}
