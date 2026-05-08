import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './alfa-vars.css'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './router.jsx'
import { useAppStore } from './stores/appStore.js'
import { getUnits } from './shared/mock/units.js'
import { getCurrentUser, getAccessUsers } from './shared/mock/users.js'
import { getAnalyticsSessions } from './shared/mock/analytics.js'
import { seedCltvExam } from './shared/mock/cltvExam.js'
import { seedSalesTrainer } from './shared/mock/salesTrainer.js'

// Bump this version whenever the mock data schema changes.
// All users' localStorage will be cleared on the next load.
const DATA_VERSION = '2'
const VER_KEY = 'ai-mentor-data-version'

if (localStorage.getItem(VER_KEY) !== DATA_VERSION) {
  ;['ai-mentor-builder-data-v1', 'ai-mentor-sandbox-session-v1', 'ai-mentor-catalog-state-v1'].forEach(k => localStorage.removeItem(k))
  localStorage.setItem(VER_KEY, DATA_VERSION)
}

seedCltvExam()
seedSalesTrainer()

// Читаем bootstrap или используем mock-данные
const bootstrap = window.AI_MENTOR_BOOTSTRAP || {}
const currentUser = getCurrentUser(bootstrap)
const units = getUnits({ currentUser, bootstrap })
const analyticsSessions = getAnalyticsSessions(bootstrap)
const accessUsers = getAccessUsers(bootstrap)

useAppStore.getState().init({ currentUser, units, analyticsSessions, accessUsers })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
