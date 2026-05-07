/**
 * useSandboxEngine — hook that drives the trainer/exam conversation logic.
 * Returns { handleInput, handleStartButton, handleNextButton } for use in UI.
 */
import { useCallback } from 'react'
import {
  useSandboxStore,
  flattenQuestions,
  getNodeHtml,
  findParentCase,
  extractClientFromCase,
  MOCK_CORRECT,
  MOCK_HINTS,
} from '../../stores/sandboxStore.js'

export function useSandboxEngine() {
  const store = useSandboxStore()

  // botSay: add typing indicator → wait → add bot message → unblock
  async function botSay(html, delay = 750, msgType = null) {
    store.setBusy(true)
    store.addMessage('typing', '')
    await new Promise(r => setTimeout(r, delay))
    useSandboxStore.setState(s => ({ messages: s.messages.filter(m => m.role !== 'typing') }))
    store.addMessage(store.unit?.type === 'exam' ? 'client' : 'bot', html, msgType)
    store.setBusy(false)
  }

  // ── TRAINER ────────────────────────────────────────
  async function trainerGreeting() {
    const { unit } = useSandboxStore.getState()
    const obHtml = getNodeHtml(unit, 'onboarding')
    let html = `<p>Добро пожаловать в тестовую среду тренажёра!</p>
<p>Вы проверяете тренажёр <strong>«${unit.title}»</strong>.</p>`
    if (obHtml) html += `<div class="sb-msg__block">${obHtml}</div>`
    await botSay(html, 400, 'theory')
    store.updateSession({ phase: 'greeting' })
  }

  async function trainerStart() {
    store.updateSession({ phase: 'running', questionIndex: 0, errors: [] })
    await botSay('<p>Начинаем тренировку! Отвечайте на вопросы в формате диалога с клиентом.</p>', 500, 'practice')
    await trainerAskQuestion()
  }

  async function trainerAskQuestion() {
    const { unit, session } = useSandboxStore.getState()
    const questions = flattenQuestions(unit)
    const idx = session.questionIndex
    if (idx >= questions.length) { await trainerFinish(); return }

    const q      = questions[idx]
    const parent = findParentCase(unit, q)

    if (parent?.type === 'case') {
      store.setClient(extractClientFromCase(parent))
    }

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

    await botSay(html, 600, 'practice')
  }

  const CTA_RE = /оформ|закаж|расскаж|помог|отправл|попробу|предлаг/i

  function isAnswerSufficient(text, q) {
    const t = text.trim()
    if (q.content?.refAnswer?.trim()) {
      return t.length >= 60 && CTA_RE.test(t)
    }
    return t.length >= 15
  }

  function getQuestionHints(q) {
    return (q.content?.hints || [])
      .filter(h => h?.text?.trim() || (typeof h === 'string' && h.trim()))
      .map(h => (typeof h === 'string' ? h : h.text))
  }

  function refAnswerBlock(q) {
    return q.content?.refAnswer?.trim()
      ? `<div class="sb-msg__ref"><span class="sb-msg__ref-label">Эталонный ответ:</span><span>${q.content.refAnswer}</span></div>`
      : ''
  }

  async function trainerHandleAnswer(text) {
    const { unit, session } = useSandboxStore.getState()
    const questions = flattenQuestions(unit)
    const idx     = session.questionIndex
    const q       = questions[idx]
    const isRetry = !!session.retryMode
    const isGood  = isAnswerSufficient(text, q)

    if (q.content?.feedback?.trim()) {
      await botSay(`<p>${q.content.feedback}</p>`, 650, 'practice')
      store.updateSession({ questionIndex: idx + 1, retryMode: false })
      await trainerAskQuestion()
      return
    }

    if (isGood) {
      const corrIdx = idx % MOCK_CORRECT.length
      let html = `<p>${MOCK_CORRECT[corrIdx]}</p>${refAnswerBlock(q)}`
      await botSay(html, 650, 'practice')
      store.updateSession({ questionIndex: idx + 1, retryMode: false })
      await trainerAskQuestion()
      return
    }

    const errors = [...(session.errors || []), idx]

    if (isRetry) {
      let html = `<p>❌ Ответ по-прежнему не соответствует ожидаемому. Посмотрите, как нужно отвечать:</p>${refAnswerBlock(q)}`
      await botSay(html, 700, 'practice')
      store.updateSession({ questionIndex: idx + 1, retryMode: false, errors })
      await trainerAskQuestion()
    } else {
      const hints = getQuestionHints(q)
      const hintLines = hints.length
        ? hints.map(h => `<p>💡 ${h}</p>`).join('')
        : `<p>💡 ${MOCK_HINTS[idx % MOCK_HINTS.length]}</p>`
      let html = `<p>⚠️ Ответ не содержит всех необходимых элементов — попробуйте ещё раз!</p>${hintLines}`
      await botSay(html, 650, 'practice')
      store.updateSession({ retryMode: true, errors })
    }
  }

  async function trainerFinish() {
    const { unit } = useSandboxStore.getState()
    const compHtml = getNodeHtml(unit, 'completion')
    let html = '<p>🏁 <strong>Тренировка завершена!</strong></p>'
    if (compHtml) html += `<div class="sb-msg__block">${compHtml}</div>`
    await botSay(html, 600, 'practice')
    // Show "Завершить тренировку" button — modal appears only on click
    store.setPhase('finished')
  }

  // ── EXAM ─────────────────────────────────────────
  async function examAskQuestion() {
    const { unit, session } = useSandboxStore.getState()
    const questions = flattenQuestions(unit)
    const idx = session.questionIndex
    if (idx >= questions.length) { await examFinish(); return }

    const q      = questions[idx]
    const parent = findParentCase(unit, q)

    let clientName = useSandboxStore.getState().client.name
    if (parent?.type === 'case') {
      const clientInfo = extractClientFromCase(parent)
      store.setClient(clientInfo)
      clientName = clientInfo.name
      useSandboxStore.getState().registerCase(parent.id, clientName)
    }

    let html = `<div class="sb-msg__client-hdr">👤 ${clientName}</div>`
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

  // ── THEORY STEPS ────────────────────────────────────────────────────────────
  async function trainerTheoryStep(idx) {
    const { unit } = useSandboxStore.getState()
    const onboarding = unit.children?.find(c => c.type === 'onboarding')
    const steps = onboarding?.content?.theorySteps || []

    if (idx >= steps.length) {
      store.updateSession({ phase: 'running', questionIndex: 0, errors: [] })
      await botSay('<p>Отлично! Начинаем тренировку. Отвечайте на возражения клиентов, используя правило трёх шагов.</p>', 400, 'practice')
      await trainerAskQuestion()
      return
    }

    const step = steps[idx]
    let html = step.heading ? `<p><strong>${step.heading}</strong></p>` : ''
    html += `<p>${(step.text || '').replace(/\n/g, '<br/>')}</p>`

    await botSay(html, 600, 'theory')
    store.updateSession({ phase: 'theory', theoryIndex: idx })
  }

  // ── PUBLIC API ────────────────────────────────────
  const handleInput = useCallback(async (text) => {
    const { unit, session, isBusy } = useSandboxStore.getState()
    if (!text.trim() || isBusy) return

    store.addMessage('user', `<p>${text}</p>`)

    if (unit.type === 'trainer') {
      if (session.phase === 'running') {
        await trainerHandleAnswer(text)
      }
    } else {
      if (session.phase === 'running') {
        await examHandleAnswer()
      }
    }
  }, [])

  const handleStartButton = useCallback(async () => {
    const { unit, isBusy } = useSandboxStore.getState()
    if (isBusy) return
    const onboarding = unit.children?.find(c => c.type === 'onboarding')
    const theorySteps = onboarding?.content?.theorySteps || []
    if (theorySteps.length > 0) {
      await trainerTheoryStep(0)
    } else {
      await trainerStart()
    }
  }, [])

  const handleNextButton = useCallback(async () => {
    const { session, isBusy } = useSandboxStore.getState()
    if (isBusy) return
    await trainerTheoryStep((session.theoryIndex ?? 0) + 1)
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

  const handleFinish = useCallback(() => {
    store.setPhase('done')
  }, [])

  return { handleInput, handleStartButton, handleNextButton, startTrainer, startExam, resumeExam, handleFinish }
}
