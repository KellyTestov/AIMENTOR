import { useState } from 'react'
import { useAppStore } from '../stores/appStore.js'
import Sidebar from '../components/layout/Sidebar.jsx'
import CatalogSection from '../components/catalog/CatalogSection.jsx'
import AnalyticsSection from '../components/analytics/AnalyticsSection.jsx'
import AdminSection from '../components/admin/AdminSection.jsx'
import WizardModal from '../components/wizard/WizardModal.jsx'
import Toast from '../components/shared/Toast.jsx'
import { Button } from '@alfalab/core-components/button/esm'

const SECTION_META = {
  catalog:   { title: 'Каталог обучения',   subtitle: 'Единицы обучения созданные на платформе AI-ментора' },
  analytics: { title: 'Аналитика',           subtitle: 'Статистика прохождения обучения сотрудниками' },
  admin:     { title: 'Управление доступом', subtitle: 'Управление ролями доступа в AI-Ментор' },
}

export default function HomePage() {
  const currentUser = useAppStore((s) => s.currentUser)
  const rights = currentUser?.rights || {}

  // Определяем начальный раздел
  const defaultSection = rights.canViewCatalog ? 'catalog'
    : rights.canViewAnalytics ? 'analytics'
    : rights.canManageUsers ? 'admin'
    : 'catalog'

  const [activeSection, setActiveSection] = useState(defaultSection)
  const [wizardOpen, setWizardOpen] = useState(false)

  if (!rights.canAccessHome) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', textAlign: 'center' }}>
        <div>
          <h1>Нет доступа</h1>
          <p style={{ color: 'var(--muted)' }}>У вас нет прав для просмотра этой страницы.</p>
        </div>
      </div>
    )
  }

  const meta = SECTION_META[activeSection] || SECTION_META.catalog

  return (
    <div className="app-shell">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />

      <div className="workspace">
        <header className="workspace__header">
          <div>
            <h1 className="workspace__title">{meta.title}</h1>
            <p className="workspace__subtitle">{meta.subtitle}</p>
          </div>
          {activeSection === 'catalog' && rights.canCreate && (
            <Button view="accent" size={40} onClick={() => setWizardOpen(true)}>
              Создать обучение
            </Button>
          )}
        </header>

        {activeSection === 'catalog' && rights.canViewCatalog && (
          <CatalogSection onOpenWizard={() => setWizardOpen(true)} />
        )}
        {activeSection === 'analytics' && rights.canViewAnalytics && (
          <AnalyticsSection />
        )}
        {activeSection === 'admin' && rights.canManageUsers && (
          <AdminSection />
        )}
      </div>

      <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
      <Toast />
    </div>
  )
}
