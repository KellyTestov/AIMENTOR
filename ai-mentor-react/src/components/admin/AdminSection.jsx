import { useState, useMemo } from 'react'
import { useAppStore } from '../../stores/appStore.js'
import { REQUIRED_SERVICE_USERS } from '../../shared/mock/users.js'
import { ROLE_LEVELS, getRoleLevel } from '../../core/constants.js'
import ConfirmModal from '../shared/ConfirmModal.jsx'
import RoleBadge from './RoleBadge.jsx'
import RolePicker from './RolePicker.jsx'
import PermissionMatrixModal from './PermissionMatrixModal.jsx'
import UserActionsMenu from './UserActionsMenu.jsx'
import AccessRequestsList from './AccessRequestsList.jsx'
import { Input } from '@alfalab/core-components/input/esm'
import { Button } from '@alfalab/core-components/button/esm'
import { Select } from '@alfalab/core-components/select/esm'

const PROTECTED_IDS = new Set(REQUIRED_SERVICE_USERS.map((u) => u.userId))

export default function AdminSection() {
  const accessUsers = useAppStore((s) => s.accessUsers)
  const setAccessUsers = useAppStore((s) => s.setAccessUsers)
  const currentUser = useAppStore((s) => s.currentUser)

  const myLevel = currentUser?.level ?? 0
  const canReview = myLevel >= 5
  const maxAssignableLevel = myLevel >= 6 ? 6 : myLevel >= 5 ? 4 : -1

  const [tab, setTab] = useState('users')
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [matrixOpen, setMatrixOpen] = useState(false)
  const [pickerFor, setPickerFor] = useState(null)
  const [confirmRevoke, setConfirmRevoke] = useState(null)

  // Разделяем заявки (L0) и активных пользователей
  const requests = useMemo(
    () => accessUsers.filter((u) => u.level === 0),
    [accessUsers]
  )
  const activeUsers = useMemo(
    () => accessUsers.filter((u) => u.level !== 0),
    [accessUsers]
  )

  // Фильтрация активных по поиску и уровню
  const filteredUsers = useMemo(() => {
    let list = activeUsers
    if (levelFilter !== 'all') {
      const lvl = Number(levelFilter)
      list = list.filter((u) => u.level === lvl)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.userId.toLowerCase().includes(q) ||
        getRoleLevel(u.level).name.toLowerCase().includes(q)
      )
    }
    // Сортируем по уровню (сверху — выше)
    return [...list].sort((a, b) => b.level - a.level)
  }, [activeUsers, search, levelFilter])

  // Сводка по уровням
  const levelCounts = useMemo(() => {
    const counts = {}
    activeUsers.forEach((u) => {
      counts[u.level] = (counts[u.level] || 0) + 1
    })
    return counts
  }, [activeUsers])

  // ── Действия ──
  function handleChangeLevel(user, newLevel) {
    const updated = accessUsers.map((u) =>
      u.userId === user.userId ? { ...u, level: newLevel } : u
    )
    setAccessUsers(updated)
    setPickerFor(null)
  }

  function handleRevoke(user) {
    const updated = accessUsers.filter((u) => u.userId !== user.userId)
    setAccessUsers(updated)
    setConfirmRevoke(null)
  }

  function handleApproveRequest(userId, level) {
    const updated = accessUsers.map((u) =>
      u.userId === userId ? { ...u, level } : u
    )
    setAccessUsers(updated)
  }

  function handleRejectRequest(userId) {
    const updated = accessUsers.filter((u) => u.userId !== userId)
    setAccessUsers(updated)
  }

  const levelFilterOptions = [
    { key: 'all', content: 'Все уровни' },
    ...ROLE_LEVELS.filter((r) => r.level >= 1).map((r) => ({
      key: String(r.level),
      content: `L${r.level} · ${r.name}`,
    })),
  ]

  return (
    <section className="section section--admin" aria-label="Управление доступом">
      <div className="admin-card">
        {/* Tabs */}
        <div className="admin-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'users'}
            className={`admin-tab${tab === 'users' ? ' is-active' : ''}`}
            onClick={() => setTab('users')}
          >
            <span>Пользователи</span>
            <span className="admin-tab__badge">{activeUsers.length}</span>
          </button>
          {canReview && (
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'requests'}
              className={`admin-tab${tab === 'requests' ? ' is-active' : ''}${requests.length > 0 ? ' has-pending' : ''}`}
              onClick={() => setTab('requests')}
            >
              <span>Заявки на доступ</span>
              {requests.length > 0 && <span className="admin-tab__badge admin-tab__badge--alert">{requests.length}</span>}
            </button>
          )}
        </div>

        {/* === USERS TAB === */}
        {tab === 'users' && (
          <>
            {/* Toolbar */}
            <div className="admin-toolbar">
              <Input
                size={40}
                placeholder="Поиск по имени, ID, роли..."
                value={search}
                onChange={(_, { value }) => setSearch(value)}
                clear
                className="admin-search"
                style={{ width: 360 }}
              />
              <Select
                size={40}
                options={levelFilterOptions}
                selected={levelFilterOptions.find((o) => o.key === String(levelFilter))}
                onChange={({ selected }) => selected && setLevelFilter(selected.key)}
                optionsListWidth="content"
                style={{ minWidth: 220 }}
              />
              <div style={{ flex: 1 }} />
              <Button
                view="secondary"
                size={40}
                onClick={() => setMatrixOpen(true)}
              >
                📊 Матрица прав
              </Button>
            </div>

            {/* Summary chips */}
            <div className="admin-summary">
              {ROLE_LEVELS.filter((r) => r.level >= 1).map((r) => {
                const count = levelCounts[r.level] || 0
                if (count === 0) return null
                return (
                  <button
                    key={r.level}
                    type="button"
                    className={`admin-summary__chip${levelFilter === String(r.level) ? ' is-active' : ''}`}
                    style={{ '--role-color': r.color, '--role-bg': r.bgColor }}
                    onClick={() => setLevelFilter(levelFilter === String(r.level) ? 'all' : String(r.level))}
                  >
                    <span className="admin-summary__dot" />
                    <span className="admin-summary__name">L{r.level} · {r.short}</span>
                    <span className="admin-summary__count">{count}</span>
                  </button>
                )
              })}
            </div>

            {/* Table */}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Пользователь</th>
                    <th>ID</th>
                    <th>Уровень доступа</th>
                    <th aria-label="Действия" />
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={4} className="admin-empty-row">Пользователи не найдены</td></tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isProtected = PROTECTED_IDS.has(user.userId) || user.isProtected
                      const isSelf = user.userId === currentUser?.id
                      const canChangeLevel =
                        !isProtected &&
                        !isSelf &&
                        maxAssignableLevel >= 1 &&
                        (myLevel >= 6 || user.level < myLevel)
                      const canRevoke = !isProtected && !isSelf && myLevel >= 5

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
                              {isSelf && <span className="self-badge">вы</span>}
                            </span>
                          </td>
                          <td><code>{user.userId}</code></td>
                          <td>
                            <RoleBadge level={user.level} />
                          </td>
                          <td className="admin-table__actions">
                            <UserActionsMenu
                              canChangeLevel={canChangeLevel}
                              canRevoke={canRevoke}
                              onChangeLevel={() => setPickerFor(user)}
                              onRevoke={() => setConfirmRevoke(user)}
                            />
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* === REQUESTS TAB === */}
        {tab === 'requests' && canReview && (
          <div style={{ padding: '20px 24px 28px' }}>
            <AccessRequestsList
              requests={requests}
              maxAssignableLevel={maxAssignableLevel}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
            />
          </div>
        )}
      </div>

      {/* === Modals === */}
      {pickerFor && (
        <RolePicker
          open={!!pickerFor}
          currentLevel={pickerFor.level}
          maxLevel={maxAssignableLevel}
          includeRequest={false}
          userName={pickerFor.fullName}
          onConfirm={(newLevel) => handleChangeLevel(pickerFor, newLevel)}
          onCancel={() => setPickerFor(null)}
        />
      )}

      <PermissionMatrixModal
        open={matrixOpen}
        onClose={() => setMatrixOpen(false)}
      />

      <ConfirmModal
        open={!!confirmRevoke}
        title="Забрать доступ?"
        description={confirmRevoke ? `Доступ для <strong>${confirmRevoke.fullName}</strong> будет отозван.` : ''}
        confirmLabel="Забрать"
        onConfirm={() => handleRevoke(confirmRevoke)}
        onCancel={() => setConfirmRevoke(null)}
      />
    </section>
  )
}
