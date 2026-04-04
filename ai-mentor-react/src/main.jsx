import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './router.jsx'
import { useAppStore } from './stores/appStore.js'
import { getUnits } from './shared/mock/units.js'
import { getCurrentUser, getAccessUsers } from './shared/mock/users.js'
import { getAnalyticsSessions } from './shared/mock/analytics.js'

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
