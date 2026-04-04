import { createBrowserRouter } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import BuilderPage from './pages/BuilderPage.jsx'
import SandboxPage from './pages/SandboxPage.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/builder',
    element: <BuilderPage />,
  },
  {
    path: '/sandbox',
    element: <SandboxPage />,
  },
])
