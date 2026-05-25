import { getRoleLevel } from '../../core/constants.js'

/**
 * Бейдж уровня доступа.
 * Используется в таблице пользователей и везде, где показывается роль.
 *
 * Props:
 *   level: 0..6
 *   size: 'sm' | 'md' (default md)
 *   showLabel: bool (default true) — показывать ли название
 */
export default function RoleBadge({ level, size = 'md', showLabel = true, dim = false }) {
  const role = getRoleLevel(level)
  const cls = `role-badge role-badge--${size}${dim ? ' role-badge--dim' : ''}`

  return (
    <span
      className={cls}
      style={{
        '--role-color': role.color,
        '--role-bg': role.bgColor,
      }}
      title={role.description}
    >
      <span className="role-badge__dot" />
      <span className="role-badge__level">L{role.level}</span>
      {showLabel && (
        <>
          <span className="role-badge__sep">·</span>
          <span className="role-badge__name">{role.name}</span>
        </>
      )}
    </span>
  )
}
