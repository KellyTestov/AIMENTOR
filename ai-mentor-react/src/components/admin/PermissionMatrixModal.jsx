import { useState } from 'react'
import { ModalDesktop } from '@alfalab/core-components/modal/esm/desktop'
import { Button } from '@alfalab/core-components/button/esm'
import { ROLE_LEVELS, getRoleLevel } from '../../core/constants.js'
import { useMatrixStore } from '../../stores/matrixStore.js'

export default function PermissionMatrixModal({ open, onClose, highlightLevel = null }) {
  const [hoveredCol, setHoveredCol] = useState(highlightLevel)
  const PERMISSION_MATRIX = useMatrixStore((s) => s.matrix)

  const activeCol = hoveredCol !== null ? hoveredCol : highlightLevel

  return (
    <ModalDesktop open={open} onClose={onClose} size={1140} hasCloser={true}>
      <ModalDesktop.Header title="Матрица прав по уровням" />
      <ModalDesktop.Content>
        <p className="pm-modal__lead">
          Каждый уровень доступа включает права предыдущего и добавляет свои.
          Наведите на колонку, чтобы увидеть полный набор прав уровня.
        </p>

        <div className="pm-matrix">
          <table className="pm-table">
            <thead>
              <tr>
                <th className="pm-table__action">Право / действие</th>
                {ROLE_LEVELS.map((r) => (
                  <th
                    key={r.level}
                    className={`pm-table__lvl${activeCol === r.level ? ' is-active' : ''}`}
                    style={{ '--col-color': r.color, '--col-bg': r.bgColor }}
                    onMouseEnter={() => setHoveredCol(r.level)}
                    onMouseLeave={() => setHoveredCol(highlightLevel)}
                  >
                    <span className="pm-table__lvl-num">L{r.level}</span>
                    <span className="pm-table__lvl-name">{r.short}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_MATRIX.map((perm) => (
                <tr key={perm.id}>
                  <td className="pm-table__action">{perm.label}</td>
                  {ROLE_LEVELS.map((r, idx) => {
                    const allowed = perm.perLevel[idx]
                    return (
                      <td
                        key={r.level}
                        className={`pm-table__cell${activeCol === r.level ? ' is-active' : ''}${allowed ? ' is-yes' : ' is-no'}`}
                        style={{ '--col-color': r.color, '--col-bg': r.bgColor }}
                        onMouseEnter={() => setHoveredCol(r.level)}
                        onMouseLeave={() => setHoveredCol(highlightLevel)}
                      >
                        {allowed ? '✓' : '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pm-legend">
          {ROLE_LEVELS.map((r) => (
            <div key={r.level} className="pm-legend__item">
              <span className="pm-legend__dot" style={{ background: r.color }} />
              <span className="pm-legend__name">L{r.level} · {r.name}</span>
              <span className="pm-legend__desc">{r.description}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <Button view="secondary" size={40} onClick={onClose}>Закрыть</Button>
        </div>
      </ModalDesktop.Content>
    </ModalDesktop>
  )
}
