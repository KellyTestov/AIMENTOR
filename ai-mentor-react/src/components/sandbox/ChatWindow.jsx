import { useEffect, useRef } from 'react'
import { useSandboxStore } from '../../stores/sandboxStore.js'
import { QuestionTimer } from './ExamTimer.jsx'

const HDR_OPEN  = '<div class="sb-msg__client-hdr">'
const HDR_CLOSE = '</div>'

function Message({ msg, unitType, showTimer }) {
  if (msg.role === 'typing') {
    const cssRole = unitType === 'exam' ? 'client' : 'bot'
    return (
      <div className={`sb-msg sb-msg--${cssRole} sb-msg--typing`}>
        <span /><span /><span />
      </div>
    )
  }

  const cssRole   = (unitType === 'exam' && msg.role === 'bot') ? 'client' : msg.role
  const typeClass = msg.msgType ? ` sb-msg-type--${msg.msgType}` : ''

  // For the last active client message in exam mode, split out the client-hdr
  // so we can inject the QuestionTimer React component inline on the same row.
  if (showTimer && msg.html.startsWith(HDR_OPEN)) {
    const closeAt = msg.html.indexOf(HDR_CLOSE)
    const hdrText = msg.html.slice(HDR_OPEN.length, closeAt)      // e.g. "👤 Петрова Анна"
    const rest    = msg.html.slice(closeAt + HDR_CLOSE.length)

    return (
      <div className={`sb-msg sb-msg--${cssRole}${typeClass}`}>
        <div className="sb-msg__client-hdr sb-msg__client-hdr--row">
          <span>{hdrText}</span>
          <QuestionTimer />
        </div>
        <div dangerouslySetInnerHTML={{ __html: rest }} />
      </div>
    )
  }

  return (
    <div
      className={`sb-msg sb-msg--${cssRole}${typeClass}`}
      dangerouslySetInnerHTML={{ __html: msg.html }}
    />
  )
}

export default function ChatWindow() {
  const messages     = useSandboxStore(s => s.messages)
  const unit         = useSandboxStore(s => s.unit)
  const phase        = useSandboxStore(s => s.phase)
  const cases        = useSandboxStore(s => s.cases)
  const activeCaseId = useSandboxStore(s => s.activeCaseId)
  const bottomRef    = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, activeCaseId])

  // In exam mode with tabs, show only messages for the active case
  const isExamTabs = unit?.type === 'exam' && cases.length > 0
  const visibleMessages = isExamTabs
    ? messages.filter(m => m.caseId === activeCaseId)
    : messages

  // Find last non-user, non-typing message in visible set to show timer on
  const isExamRunning = unit?.type === 'exam' && phase === 'running'
  let lastBotIdx = -1
  if (isExamRunning) {
    for (let i = visibleMessages.length - 1; i >= 0; i--) {
      if (visibleMessages[i].role !== 'user' && visibleMessages[i].role !== 'typing') {
        lastBotIdx = i
        break
      }
    }
  }

  return (
    <div className="sb-chat">
      {visibleMessages.map((msg, idx) => (
        <Message
          key={msg.id}
          msg={msg}
          unitType={unit?.type}
          showTimer={idx === lastBotIdx}
        />
      ))}
      <div ref={bottomRef} style={{ height: 0 }} />
    </div>
  )
}
