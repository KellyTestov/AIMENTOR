import { useAppStore } from '../../stores/appStore.js'
import { initials } from '../../core/utils.js'

const NAV_ITEMS = [
  { id: 'catalog',   label: 'Каталог обучения',   right: 'canViewCatalog',   icon: '/mortarboard.png' },
  { id: 'analytics', label: 'Аналитика',           right: 'canViewAnalytics', icon: '/analytics.png' },
  { id: 'admin',     label: 'Управление доступом', right: 'canManageUsers',   icon: '/admin-dashboard.png' },
]

export default function Sidebar({ activeSection, onNavigate }) {
  const currentUser = useAppStore((s) => s.currentUser)
  const rights = currentUser?.rights || {}

  const visibleItems = NAV_ITEMS.filter((item) => rights[item.right])

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <img src="/robot.png" alt="" className="brand-logo" aria-hidden="true" />
        <span className="brand-title">AI-Ментор</span>
      </div>

      <nav className="sidebar__nav" aria-label="Основная навигация">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            className={`nav-link${activeSection === item.id ? ' is-active' : ''}`}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            <img src={item.icon} alt="" className="nav-icon" aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        {currentUser && (
          <div className="user-chip">
            <div className="user-chip__avatar" aria-hidden="true">
              {initials(currentUser.name)}
            </div>
            <div>
              <div className="user-chip__name">{currentUser.name}</div>
              <div className="user-chip__role">{currentUser.roleName}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
