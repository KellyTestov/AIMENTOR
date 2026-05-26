import { useState } from 'react'
import { Button } from '@alfalab/core-components/button/esm'
import { ROLE_LEVELS } from '../../core/constants.js'
import { useMatrixStore } from '../../stores/matrixStore.js'
import ConfirmModal from '../shared/ConfirmModal.jsx'

/**
 * Редактируемая матрица прав уровней — доступна только L6.
 * Каждая ячейка — toggle.
 */
export default function AdminRightsEditor() {
  const matrix = useMatrixStore((s) => s.matrix)
  const togglePermission = useMatrixStore((s) => s.togglePermission)
  const reset = useMatrixStore((s) => s.reset)
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="adminrights">
      <div className="adminrights__head">
        <div>
          <h2 className="adminrights__title">Админ-права уровней</h2>
          <p className="adminrights__desc">
            Глобальное редактирование прав каждого уровня. Изменения сохраняются и применяются ко всей платформе.
          </p>
        </div>
        <Button view="secondary" size={40} onClick={() => setConfirmReset(true)}>
          Сбросить к умолчанию
        </Button>
      </div>

      <div className="adminrights__matrix">
        <table className="ar-table">
          <thead>
            <tr>
              <th className="ar-table__action">Право / действие</th>
              {ROLE_LEVELS.map((r) => (
                <th
                  key={r.level}
                  className="ar-table__lvl"
                  style={{ '--col-color': r.color, '--col-bg': r.bgColor }}
                >
                  <span className="ar-table__lvl-num">L{r.level}</span>
                  <span className="ar-table__lvl-name">{r.short}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((perm) => (
              <tr key={perm.id}>
                <td className="ar-table__action">{perm.label}</td>
                {ROLE_LEVELS.map((r, idx) => {
                  const allowed = perm.perLevel[idx]
                  return (
                    <td
                      key={r.level}
                      className={`ar-table__cell${allowed ? ' is-yes' : ' is-no'}`}
                      style={{ '--col-color': r.color, '--col-bg': r.bgColor }}
                    >
                      <button
                        type="button"
                        className={`ar-cell-toggle${allowed ? ' is-on' : ''}`}
                        onClick={() => togglePermission(perm.id, idx)}
                        aria-label={allowed ? 'Запретить' : 'Разрешить'}
                        title={allowed ? 'Запретить для уровня' : 'Разрешить для уровня'}
                      >
                        {allowed ? '✓' : '—'}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={confirmReset}
        title="Сбросить матрицу прав?"
        description="Все ваши изменения будут отменены и матрица вернётся к значениям по умолчанию."
        confirmLabel="Сбросить"
        onConfirm={() => { reset(); setConfirmReset(false) }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}
