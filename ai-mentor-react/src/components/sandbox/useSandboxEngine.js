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
  extractClientFromCase,
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

    await botSay(html, 600)
  }

  // Для вопросов с эталонным ответом (3 шага) требуем минимальную длину
  // И наличие призыва к действию — иначе ответ неполный
  const CTA_RE = /оформ|закаж|расскаж|помог|отправл|попробу|предлаг/i

  function isAnswerSufficient(text, q) {
    const t = text.trim()
    if (q.content?.refAnswer?.trim()) {
      // Структурированный вопрос (3 шага): нужна длина И призыв к действию
      return t.length >= 60 && CTA_RE.test(t)
    }
    // Обычный вопрос — просто не слишком короткий
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

    // Custom per-question feedback bypasses retry logic
    if (q.content?.feedback?.trim()) {
      await botSay(`<p>${q.content.feedback}</p>`, 650)
      store.updateSession({ questionIndex: idx + 1, retryMode: false })
      await trainerAskQuestion()
      return
    }

    if (isGood) {
      // ── Correct ───────────────────────────────────────────────────────
      const corrIdx = idx % MOCK_CORRECT.length
      let html = `<p>${MOCK_CORRECT[corrIdx]}</p>${refAnswerBlock(q)}`
      await botSay(html, 650)
      store.updateSession({ questionIndex: idx + 1, retryMode: false })
      await trainerAskQuestion()
      return
    }

    // ── Insufficient answer ───────────────────────────────────────────
    const errors = [...(session.errors || []), idx]

    if (isRetry) {
      // Second wrong attempt → show ref answer and move on
      let html = `<p>❌ Ответ по-прежнему не соответствует ожидаемому. Посмотрите, как нужно отвечать:</p>${refAnswerBlock(q)}`
      await botSay(html, 700)
      store.updateSession({ questionIndex: idx + 1, retryMode: false, errors })
      await trainerAskQuestion()
    } else {
      // First wrong attempt → give all hints, allow retry
      const hints = getQuestionHints(q)
      const hintLines = hints.length
        ? hints.map(h => `<p>💡 ${h}</p>`).join('')
        : `<p>💡 ${MOCK_HINTS[idx % MOCK_HINTS.length]}</p>`
      let html = `<p>⚠️ Ответ не содержит всех необходимых элементов — попробуйте ещё раз!</p>${hintLines}`
      await botSay(html, 650)
      store.updateSession({ retryMode: true, errors })
    }
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

    if (parent?.type === 'case') {
      store.setClient(extractClientFromCase(parent))
    }

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

  // ── THEORY STEPS (optional, trainer only) ────────────────────────────────
  async function trainerTheoryStep(idx) {
    const { unit } = useSandboxStore.getState()
    const onboarding = unit.children?.find(c => c.type === 'onboarding')
    const steps = onboarding?.content?.theorySteps || []

    if (idx >= steps.length) {
      store.updateSession({ phase: 'running', questionIndex: 0, errors: [] })
      await botSay('<p>Отлично! Начинаем тренировку. Отвечайте на возражения клиентов, используя правило трёх шагов.</p>', 400)
      await trainerAskQuestion()
      return
    }

    const step = steps[idx]
    const isLast = idx === steps.length - 1
    let html = step.heading ? `<p><strong>${step.heading}</strong></p>` : ''
    html += `<p>${(step.text || '').replace(/\n/g, '<br/>')}</p>`
    html += `<p><em>Напишите <strong>«Дальше»</strong>, чтобы ${isLast ? 'начать тренировку' : 'продолжить'}.</em></p>`

    await botSay(html, 600)
    store.updateSession({ phase: 'theory', theoryIndex: idx })
  }

  // ── PUBLIC API ────────────────────────────────────
  const handleInput = useCallback(async (text) => {
    const { unit, session, isBusy } = useSandboxStore.getState()
    if (!text.trim() || isBusy) return

    store.addMessage('user', `<p>${text}</p>`)

    if (unit.type === 'trainer') {
      if (session.phase === 'greeting') {
        if (/^старт$/i.test(text.trim())) {
          const onboarding = unit.children?.find(c => c.type === 'onboarding')
          const theorySteps = onboarding?.content?.theorySteps || []
          if (theorySteps.length > 0) {
            await trainerTheoryStep(0)
          } else {
            await trainerStart()
          }
        } else {
          await botSay('<p>Введите <strong>«Старт»</strong>, чтобы начать тренировку.</p>', 350)
        }
      } else if (session.phase === 'theory') {
        if (/^дальше$/i.test(text.trim())) {
          await trainerTheoryStep((session.theoryIndex ?? 0) + 1)
        } else {
          await botSay('<p>Напишите <strong>«Дальше»</strong>, чтобы перейти к следующему блоку.</p>', 350)
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
