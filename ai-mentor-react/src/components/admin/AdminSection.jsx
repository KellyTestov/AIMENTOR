import { useState, useMemo } from 'react'
import { useAppStore } from '../../stores/appStore.js'
import { REQUIRED_SERVICE_USERS } from '../../shared/mock/users.js'
import ConfirmModal from '../shared/ConfirmModal.jsx'

const ROLE_OPTIONS = ['Редактор', 'Аналитик', 'Администратор']
const PROTECTED_IDS = new Set(REQUIRED_SERVICE_USERS.map((u) => u.userId))

export default function AdminSection() {
  const accessUsers = useAppStore((s) => s.accessUsers)
  const setAccessUsers = useAppStore((s) => s.setAccessUsers)

  const [search, setSearch] = useState('')
  const [pending, setPending] = useState(null) // { type: 'role'|'revoke', userId, fullName, newRole?, prevRole? }

  const filtered = useMemo(() => {
    if (!search) return accessUsers
    const q = search.toLowerCase()
    return accessUsers.filter((u) =>
      u.fullName.toLowerCase().includes(q) ||
      u.userId.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    )
  }, [accessUsers, search])

  function handleRoleChange(userId, newRole, prevRole, fullName) {
    setPending({ type: 'role', userId, fullName, newRole, prevRole })
  }

  function handleRevoke(userId, fullName) {
    setPending({ type: 'revoke', userId, fullName })
  }

  function confirmAction() {
    if (!pending) return
    if (pending.type === 'role') {
      setAccessUsers(accessUsers.map((u) => u.userId === pending.userId ? { ...u, role: pending.newRole } : u))
    } else if (pending.type === 'revoke') {
      setAccessUsers(accessUsers.filter((u) => u.userId !== pending.userId))
    }
    setPending(null)
  }

  const confirmTitle = pending?.type === 'role'
    ? 'Изменить роль?'
    : 'Забрать доступ?'
  const confirmDesc = pending?.type === 'role'
    ? `Роль <strong>${pending?.fullName}</strong> будет изменена на «${pending?.newRole}».`
    : `Доступ для <strong>${pending?.fullName}</strong> будет отозван.`

  return (
    <section className="section section--admin" aria-label="Управление доступом">
      <div className="admin-card">
        <div className="admin-card__head">
          <div className="admin-card__titles">
            <h2>
              Пользователи с доступом
              <span className="admin-count">{accessUsers.length}</span>
            </h2>
            <p>Управление ролями доступа в AI-Ментор</p>
          </div>
          <label className="admin-search-label">
            <span className="sr-only">Поиск</span>
            <input
              type="search"
              placeholder="Поиск по имени, ID, роли..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>ID</th>
                <th>Роль</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="admin-empty-row">Пользователи не найдены</td></tr>
              ) : (
                filtered.map((user) => {
                  const isProtected = PROTECTED_IDS.has(user.userId) || user.isProtected
                  return (
                    <tr key={user.userId}>
                      <td>
                        <span className="admin-user-cell">
                          {user.fullName}
                          {user.isDeveloper && (
                            <span className="dev-badge">
                              DEV
                              <span className="dev-tooltip">Разработчик сервиса. Доступ не может быть изменён.</span>
                            </span>
                          )}
                        </span>
                      </td>
                      <td><code>{user.userId}</code></td>
                      <td>
                        {isProtected ? (
                          <span className="service-role-badge">{user.role}</span>
                        ) : (
                          <select
                            className="admin-role-select"
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.userId, e.target.value, user.role, user.fullName)}
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td>
                        <button
                          className="admin-action-btn"
                          type="button"
                          disabled={isProtected}
                          onClick={() => handleRevoke(user.userId, user.fullName)}
                        >
                          Забрать доступ
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={!!pending}
        title={confirmTitle}
        description={confirmDesc}
        confirmLabel={pending?.type === 'role' ? 'Изменить' : 'Забрать'}
        onConfirm={confirmAction}
        onCancel={() => setPending(null)}
      />
    </section>
  )
}
