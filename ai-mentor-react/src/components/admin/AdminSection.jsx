import { useState, useMemo } from 'react'
import { useAppStore } from '../../stores/appStore.js'
import { REQUIRED_SERVICE_USERS } from '../../shared/mock/users.js'
import { ROLE_LEVELS, getRoleLevel, BUSINESS_LINES, getBusinessLine } from '../../core/constants.js'
import ConfirmModal from '../shared/ConfirmModal.jsx'
import RoleBadge from './RoleBadge.jsx'
import RolePicker from './RolePicker.jsx'
import PermissionMatrixModal from './PermissionMatrixModal.jsx'
import UserActionsMenu from './UserActionsMenu.jsx'
import AccessRequestsList from './AccessRequestsList.jsx'
import AuditLogsList from './AuditLogsList.jsx'
import { generateLogsForBL } from '../../shared/mock/auditLogs.js'
import { Input } from '@alfalab/core-components/input/esm'
import { Button } from '@alfalab/core-components/button/esm'
import { Select } from '@alfalab/core-components/select/esm'

const PROTECTED_IDS = new Set(REQUIRED_SERVICE_USERS.map((u) => u.userId))

function formatDate(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}.${mm}.${yyyy}`
  } catch {
    return '—'
  }
}

export default function AdminSection() {
  const accessUsers = useAppStore((s) => s.accessUsers)
  const setAccessUsers = useAppStore((s) => s.setAccessUsers)
  const currentUser = useAppStore((s) => s.currentUser)

  const myLevel = currentUser?.level ?? 0
  const canReview = myLevel >= 5
  const maxAssignableLevel = myLevel >= 6 ? 6 : myLevel >= 5 ? 4 : -1

  const [bl, setBl] = useState('global')
  const [tab, setTab] = useState('users')
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [matrixOpen, setMatrixOpen] = useState(false)
  const [pickerFor, setPickerFor] = useState(null)
  const [confirmRevoke, setConfirmRevoke] = useState(null)

  const activeBl = getBusinessLine(bl)
  const isGlobalBl = bl === 'global'

  // Логи генерируются один раз на BL и кешируются
  const logs = useMemo(() => {
    if (isGlobalBl) return []
    return generateLogsForBL(bl, 60)
  }, [bl, isGlobalBl])

  // Фильтр по бизнес-линии:
  //   global  → только L6 (спец администраторы — кросс-BL)
  //   <bl>    → L6 (везде видны) + пользователи этой BL
  function inCurrentBl(u) {
    if (isGlobalBl) return u.level === 6
    return u.level === 6 || u.businessLine === bl
  }

  // Разделяем заявки (L0) и активных пользователей
  const requests = useMemo(
    () => accessUsers.filter((u) => u.level === 0 && inCurrentBl({ ...u, level: 0 })),
    [accessUsers, bl] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const activeUsers = useMemo(
    () => accessUsers.filter((u) => u.level !== 0 && inCurrentBl(u)),
    [accessUsers, bl] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Подсчёт по BL (для бейджей на BL-табах).
  // В Global — только L6. В остальных — L6 (везде) + пользователи этой BL (без L0).
  const blCounts = useMemo(() => {
    const counts = {}
    BUSINESS_LINES.forEach((b) => {
      counts[b.id] = accessUsers.filter((u) => {
        if (b.id === 'global') return u.level === 6
        if (u.level === 0) return false
        return u.level === 6 || u.businessLine === b.id
      }).length
    })
    return counts
  }, [accessUsers])

  const blRequestCounts = useMemo(() => {
    const counts = {}
    BUSINESS_LINES.forEach((b) => {
      if (b.id === 'global') { counts[b.id] = 0; return }
      counts[b.id] = accessUsers.filter((u) => u.level === 0 && u.businessLine === b.id).length
    })
    return counts
  }, [accessUsers])

  // Сводка по уровням (внутри текущей BL)
  const levelCounts = useMemo(() => {
    const counts = {}
    activeUsers.forEach((u) => {
      counts[u.level] = (counts[u.level] || 0) + 1
    })
    return counts
  }, [activeUsers])

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
        String(u.adminId || '').includes(q) ||
        getRoleLevel(u.level).name.toLowerCase().includes(q)
      )
    }
    // Сортируем по adminId
    return [...list].sort((a, b) => (a.adminId || 0) - (b.adminId || 0))
  }, [activeUsers, search, levelFilter])

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
      u.userId === userId
        ? { ...u, level, registeredAt: u.registeredAt || new Date().toISOString() }
        : u
    )
    setAccessUsers(updated)
  }

  function handleRejectRequest(userId) {
    const updated = accessUsers.filter((u) => u.userId !== userId)
    setAccessUsers(updated)
  }

  // Опции фильтра уровней со счётчиками
  const levelFilterOptions = useMemo(() => [
    { key: 'all', content: `Все уровни (${activeUsers.length})` },
    ...ROLE_LEVELS
      .filter((r) => r.level >= 1)
      .map((r) => ({
        key: String(r.level),
        content: `L${r.level} · ${r.name} (${levelCounts[r.level] || 0})`,
      })),
  ], [activeUsers.length, levelCounts])

  return (
    <section className="section section--admin" aria-label="Управление доступом">
      <div className="admin-card">
        {/* Business line top tabs */}
        <div className="admin-bl-tabs" role="tablist" aria-label="Бизнес-линии">
          {BUSINESS_LINES.map((b) => {
            const isActive = bl === b.id
            const count = blCounts[b.id] || 0
            const pending = blRequestCounts[b.id] || 0
            return (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                title={b.name}
                className={`admin-bl-tab${isActive ? ' is-active' : ''}${b.isGlobal ? ' admin-bl-tab--global' : ''}`}
                onClick={() => {
                  setBl(b.id)
                  setLevelFilter('all')
                  setSearch('')
                  if (b.id === 'global' && tab === 'logs') setTab('users')
                }}
              >
                {b.isGlobal && <span className="admin-bl-tab__icon" aria-hidden="true">★</span>}
                <span className="admin-bl-tab__name">{b.short}</span>
                <span className="admin-bl-tab__count">{count}</span>
                {pending > 0 && <span className="admin-bl-tab__dot" title={`${pending} новых заявок`} />}
              </button>
            )
          })}
        </div>

        <div className="admin-bl-context">
          <span className="admin-bl-context__name">{activeBl?.name}</span>
        </div>

        {/* Sub tabs (Users / Requests) */}
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
          {canReview && !isGlobalBl && (
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'logs'}
              className={`admin-tab${tab === 'logs' ? ' is-active' : ''}`}
              onClick={() => setTab('logs')}
            >
              <span>Логи</span>
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
                style={{ minWidth: 260 }}
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

            {/* Table */}
            <div className="admin-table-wrap">
              <table className="admin-table admin-table--levels">
                <thead>
                  <tr>
                    <th className="admin-col-id">ID</th>
                    <th>Пользователь</th>
                    <th>USERID</th>
                    <th>Дата рег.</th>
                    <th>Уровень доступа</th>
                    <th aria-label="Действия" />
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={6} className="admin-empty-row">Пользователи не найдены</td></tr>
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
                          <td className="admin-col-id">{user.adminId || '—'}</td>
                          <td>{user.fullName}</td>
                          <td><code>{user.userId}</code></td>
                          <td className="admin-col-date">{formatDate(user.registeredAt)}</td>
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

        {/* === LOGS TAB === */}
        {tab === 'logs' && canReview && !isGlobalBl && (
          <div style={{ padding: '18px 24px 28px' }}>
            <AuditLogsList logs={logs} />
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
