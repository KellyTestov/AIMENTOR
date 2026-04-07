import { useEffect, useState } from 'react'
import { Notification } from '@alfalab/core-components/notification/esm'

let toastCallback = null
export function showToast(message) {
  toastCallback?.(message)
}

export default function Toast() {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    toastCallback = (message) => {
      setMsg(message)
      setVisible(true)
    }
    return () => { toastCallback = null }
  }, [])

  return (
    <Notification
      visible={visible}
      title={msg}
      autoCloseDelay={3000}
      onCloseTimeout={() => setVisible(false)}
      onClose={() => setVisible(false)}
      usePortal
      position="bottom"
      zIndex={100}
    />
  )
}
