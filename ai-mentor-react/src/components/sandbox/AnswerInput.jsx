import { useState, useRef } from 'react'
import { useSandboxStore } from '../../stores/sandboxStore.js'

export default function AnswerInput({ onSend }) {
  const [text, setText]   = useState('')
  const isBusy = useSandboxStore(s => s.isBusy)
  const phase  = useSandboxStore(s => s.phase)
  const textareaRef = useRef(null)

  const disabled = isBusy || phase === 'done' || phase === 'rules' || phase === 'resume'

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function handleChange(e) {
    setText(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = ''
      ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
    }
  }

  function send() {
    const trimmed = text.trim()
    if (!trimmed || isBusy) return
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = ''
    onSend(trimmed)
  }

  return (
    <div className="sb-input-area">
      <textarea
        ref={textareaRef}
        className="sb-input"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? '' : 'Введите ответ...'}
        rows={1}
      />
      <button
        className="sb-send-btn"
        onClick={send}
        disabled={disabled || !text.trim()}
        title="Отправить"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  )
}
