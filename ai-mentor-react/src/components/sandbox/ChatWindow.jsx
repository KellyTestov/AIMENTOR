import { useEffect, useRef } from 'react'
import { useSandboxStore } from '../../stores/sandboxStore.js'

function Message({ msg, unitType }) {
  if (msg.role === 'typing') {
    const cssRole = unitType === 'exam' ? 'client' : 'bot'
    return (
      <div className={`sb-msg sb-msg--${cssRole} sb-msg--typing`}>
        <span /><span /><span />
      </div>
    )
  }

  const cssRole = (unitType === 'exam' && msg.role === 'bot') ? 'client' : msg.role
  const typeClass = msg.msgType ? ` sb-msg-type--${msg.msgType}` : ''
  return (
    <div
      className={`sb-msg sb-msg--${cssRole}${typeClass}`}
      dangerouslySetInnerHTML={{ __html: msg.html }}
    />
  )
}

export default function ChatWindow() {
  const messages   = useSandboxStore(s => s.messages)
  const unit       = useSandboxStore(s => s.unit)
  const bottomRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className="sb-chat">
      {messages.map(msg => (
        <Message key={msg.id} msg={msg} unitType={unit?.type} />
      ))}
      <div ref={bottomRef} style={{ height: 0 }} />
    </div>
  )
}
