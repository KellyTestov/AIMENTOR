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
  return (
    <div
      className={`sb-msg sb-msg--${cssRole}`}
      dangerouslySetInnerHTML={{ __html: msg.html }}
    />
  )
}

export default function ChatWindow() {
  const messages = useSandboxStore(s => s.messages)
  const unit     = useSandboxStore(s => s.unit)
  const chatRef  = useRef(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="sb-chat" ref={chatRef}>
      {messages.map(msg => (
        <Message key={msg.id} msg={msg} unitType={unit?.type} />
      ))}
    </div>
  )
}
