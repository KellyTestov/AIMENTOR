import { useEffect } from 'react'
import { useSandboxStore } from '../../stores/sandboxStore.js'

function pad(n) { return String(n).padStart(2, '0') }

function formatElapsed(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

function formatQuestion(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${pad(m)}:${pad(s)}`
}

function timerColorClass(sec) {
  if (sec < 1201) return 'sb-timer--green'
  if (sec < 2401) return 'sb-timer--blue'
  return 'sb-timer--red'
}

function questionColorClass(sec) {
  if (sec < 150) return 'sb-qtimer--neutral'
  if (sec < 180) return 'sb-qtimer--warn'
  return 'sb-qtimer--over'
}

export function ElapsedTimer() {
  const elapsed  = useSandboxStore(s => s.elapsed)
  const phase    = useSandboxStore(s => s.phase)
  const tickElapsed = useSandboxStore(s => s.tickElapsed)

  useEffect(() => {
    if (phase !== 'running') return
    const id = setInterval(tickElapsed, 1000)
    return () => clearInterval(id)
  }, [phase, tickElapsed])

  if (phase !== 'running') return null

  return (
    <div className={`sb-timer ${timerColorClass(elapsed)}`} id="sb-timer">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <span id="sb-timer-val">{formatElapsed(elapsed)}</span>
    </div>
  )
}

export function QuestionTimer() {
  const questionElapsed = useSandboxStore(s => s.questionElapsed)
  const phase           = useSandboxStore(s => s.phase)
  const tickQuestion    = useSandboxStore(s => s.tickQuestion)

  useEffect(() => {
    if (phase !== 'running') return
    const id = setInterval(tickQuestion, 1000)
    return () => clearInterval(id)
  }, [phase, tickQuestion])

  if (phase !== 'running') return null

  return (
    <div className={`sb-timer sb-qtimer ${questionColorClass(questionElapsed)}`} id="sb-qtimer">
      <span className="sb-qtimer__label">вопрос</span>
      <span id="sb-qtimer-val">{formatQuestion(questionElapsed)}</span>
    </div>
  )
}
