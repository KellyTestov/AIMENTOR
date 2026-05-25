import { useState } from 'react'
import { Button } from '@alfalab/core-components/button/esm'
import RoleBadge from './RoleBadge.jsx'
import RolePicker from './RolePicker.jsx'
import ConfirmModal from '../shared/ConfirmModal.jsx'

function formatRequestedAt(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return iso
  }
}

/**
 * Список заявок на доступ.
 *
 * Props:
 *   requests: array — пользователи с level=0
 *   maxAssignableLevel: number — максимальный уровень, который текущий админ может назначить
 *   onApprove: (userId, level) => void
 *   onReject: (userId) => void
 */
export default function AccessRequestsList({ requests, maxAssignableLevel, onApprove, onReject }) {
  const [pickerFor, setPickerFor] = useState(null)
  const [confirmReject, setConfirmReject] = useState(null)

  if (!requests || requests.length === 0) {
    return (
      <div className="ar-empty">
        <div className="ar-empty__icon">📭</div>
        <div className="ar-empty__title">Заявок нет</div>
        <div className="ar-empty__desc">Новые заявки на доступ появятся в этом разделе.</div>
      </div>
    )
  }

  return (
    <>
      <div className="ar-summary">
        {requests.length === 1
          ? '1 заявка ожидает рассмотрения'
          : `${requests.length} заявки ожидают рассмотрения`}
      </div>

      <div className="ar-list">
        {requests.map((u) => (
          <div key={u.userId} className="ar-card">
            <div className="ar-card__head">
              <div className="ar-card__avatar">👤</div>
              <div className="ar-card__title">
                <span className="ar-card__name">{u.fullName}</span>
                <span className="ar-card__meta">
                  <code>{u.userId}</code>
                  {u.requestedAt && (
                    <>
                      <span className="ar-card__meta-sep">·</span>
                      <span>Подана {formatRequestedAt(u.requestedAt)}</span>
                    </>
                  )}
                </span>
              </div>
              <RoleBadge level={0} size="sm" />
            </div>

            <div className="ar-card__actions">
              <Button
                view="accent"
                size={40}
                onClick={() => setPickerFor(u)}
                disabled={maxAssignableLevel < 1}
              >
                Одобрить и назначить уровень
              </Button>
              <Button
                view="secondary"
                size={40}
                onClick={() => setConfirmReject(u)}
              >
                Отклонить
              </Button>
            </div>
          </div>
        ))}
      </div>

      {pickerFor && (
        <RolePicker
          open={!!pickerFor}
          currentLevel={1}
          maxLevel={maxAssignableLevel}
          includeRequest={false}
          userName={pickerFor.fullName}
          confirmLabel="Одобрить"
          onConfirm={(level) => {
            onApprove(pickerFor.userId, level)
            setPickerFor(null)
          }}
          onCancel={() => setPickerFor(null)}
        />
      )}

      <ConfirmModal
        open={!!confirmReject}
        title="Отклонить заявку?"
        description={confirmReject ? `Заявка <strong>${confirmReject.fullName}</strong> будет удалена.` : ''}
        confirmLabel="Отклонить"
        onConfirm={() => { onReject(confirmReject.userId); setConfirmReject(null) }}
        onCancel={() => setConfirmReject(null)}
      />
    </>
  )
}
