import { useEffect, useRef } from 'react'
import { useSandboxStore } from '../../stores/sandboxStore.js'

function pad(n) { return String(n).padStart(2, '0') }

function formatTime(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

function formatQuestion(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${pad(m)}:${pad(s)}`
}

function countdownColorClass(remaining, total) {
  if (total <= 0) return 'sb-timer--green'
  const pct = remaining / total
  if (pct > 0.5) return 'sb-timer--green'
  if (pct > 0.25) return 'sb-timer--yellow'
  return 'sb-timer--red'
}

function elapsedColorClass(sec) {
  if (sec < 1201) return 'sb-timer--green'
  if (sec < 2401) return 'sb-timer--blue'
  return 'sb-timer--red'
}

function questionColorClass(sec) {
  if (sec < 150) return 'sb-qtimer--neutral'
  if (sec < 180) return 'sb-qtimer--warn'
  return 'sb-qtimer--over'
}

function getTimerConfig(unit) {
  const cn = (unit?.children || []).find(c => c.type === 'completion')
  return cn?.content?.timer || null
}

export function ElapsedTimer() {
  const elapsed          = useSandboxStore(s => s.elapsed)
  const phase            = useSandboxStore(s => s.phase)
  const unit             = useSandboxStore(s => s.unit)
  const tickElapsed      = useSandboxStore(s => s.tickElapsed)
  const setTimerExpired  = useSandboxStore(s => s.setTimerExpired)

  const timerConfig  = getTimerConfig(unit)
  const isExam       = unit?.type !== 'trainer'
  const hasLimit     = !!(timerConfig?.enabled && timerConfig?.limitMinutes > 0)
  const limitSeconds = hasLimit ? timerConfig.limitMinutes * 60 : 0

  const expiredFired = useRef(false)

  useEffect(() => {
    if (phase !== 'running') return
    const id = setInterval(tickElapsed, 1000)
    return () => clearInterval(id)
  }, [phase, tickElapsed])

  // Reset fired-flag when session restarts
  useEffect(() => {
    if (phase !== 'running') expiredFired.current = false
  }, [phase])

  // Trigger expiry
  useEffect(() => {
    if (phase !== 'running') return
    if (!hasLimit) return
    if (timerConfig.onExpire !== 'warn_and_finish') return
    if (elapsed >= limitSeconds && !expiredFired.current) {
      expiredFired.current = true
      setTimerExpired(true)
    }
  }, [elapsed, phase, hasLimit, limitSeconds, timerConfig, setTimerExpired])

  // Don't show for trainer without timer
  if (!isExam && !hasLimit) return null
  if (phase !== 'running') return null

  const remaining   = hasLimit ? Math.max(0, limitSeconds - elapsed) : null
  const colorClass  = hasLimit
    ? countdownColorClass(remaining, limitSeconds)
    : elapsedColorClass(elapsed)
  const displayTime = hasLimit ? formatTime(remaining) : formatTime(elapsed)

  return (
    <div className={`sb-timer ${colorClass}${hasLimit ? ' sb-timer--countdown' : ''}`} id="sb-timer">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      {hasLimit && <span className="sb-timer__label">осталось</span>}
      <span id="sb-timer-val">{displayTime}</span>
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
