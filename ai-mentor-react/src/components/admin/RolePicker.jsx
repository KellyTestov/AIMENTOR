import { useState } from 'react'
import { ModalDesktop } from '@alfalab/core-components/modal/esm/desktop'
import { Button } from '@alfalab/core-components/button/esm'
import { ROLE_LEVELS } from '../../core/constants.js'
import RoleBadge from './RoleBadge.jsx'
import PermissionMatrixModal from './PermissionMatrixModal.jsx'

/**
 * Модал смены уровня пользователя.
 *
 * Props:
 *   open: bool
 *   currentLevel: number — текущий уровень пользователя (selected по умолчанию)
 *   maxLevel: number — максимальный уровень, который может назначить админ (-1 если не может)
 *   includeRequest: bool (default false) — показывать ли L0 как опцию (для одобрения заявок не нужно)
 *   userName: string — имя пользователя для отображения в шапке
 *   confirmLabel: string (default 'Изменить')
 *   onConfirm: (newLevel: number) => void
 *   onCancel: () => void
 */
export default function RolePicker({
  open,
  currentLevel,
  maxLevel,
  includeRequest = false,
  userName = '',
  confirmLabel = 'Изменить',
  onConfirm,
  onCancel,
}) {
  const [picked, setPicked] = useState(currentLevel ?? 1)
  const [matrixOpen, setMatrixOpen] = useState(false)

  // При открытии — синхронизируем picked с currentLevel
  function handleCancel() {
    setPicked(currentLevel ?? 1)
    onCancel()
  }

  function handleConfirm() {
    onConfirm(picked)
  }

  const visibleLevels = includeRequest
    ? ROLE_LEVELS
    : ROLE_LEVELS.filter((r) => r.level >= 1)

  const canConfirm = picked !== currentLevel && picked <= maxLevel

  return (
    <>
      <ModalDesktop open={open} onClose={handleCancel} size={600} hasCloser={false}>
        <ModalDesktop.Header
          title={userName ? `Уровень доступа: ${userName}` : 'Выбор уровня доступа'}
          hasCloser={false}
        />
        <ModalDesktop.Content>
          <div className="rp-list">
            {visibleLevels.map((r) => {
              const isCurrent = r.level === currentLevel
              const isPicked = r.level === picked
              const isLocked = r.level > maxLevel
              const cls = [
                'rp-item',
                isPicked ? 'is-picked' : '',
                isLocked ? 'is-locked' : '',
                isCurrent ? 'is-current' : '',
              ].filter(Boolean).join(' ')

              return (
                <button
                  key={r.level}
                  type="button"
                  className={cls}
                  disabled={isLocked}
                  onClick={() => setPicked(r.level)}
                  style={{ '--role-color': r.color, '--role-bg': r.bgColor }}
                >
                  <span className="rp-item__radio">
                    {isPicked && <span className="rp-item__radio-dot" />}
                  </span>
                  <span className="rp-item__body">
                    <span className="rp-item__head">
                      <RoleBadge level={r.level} size="sm" />
                      {isCurrent && <span className="rp-item__current">текущий</span>}
                      {isLocked && <span className="rp-item__locked">недоступно</span>}
                    </span>
                    <span className="rp-item__desc">{r.description}</span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="rp-footer">
            <button
              type="button"
              className="rp-matrix-btn"
              onClick={() => setMatrixOpen(true)}
            >
              📊 Сравнить уровни (матрица прав)
            </button>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button view="secondary" size={40} onClick={handleCancel}>Отмена</Button>
              <Button view="accent" size={40} onClick={handleConfirm} disabled={!canConfirm}>
                {confirmLabel}
              </Button>
            </div>
          </div>
        </ModalDesktop.Content>
      </ModalDesktop>

      <PermissionMatrixModal
        open={matrixOpen}
        onClose={() => setMatrixOpen(false)}
        highlightLevel={picked}
      />
    </>
  )
}
