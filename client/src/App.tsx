import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import ModelsPage from './pages/ModelsPage'
import ModelDetailPage from './pages/ModelDetailPage'
import ComparePage from './pages/ComparePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FavoritesPage from './pages/FavoritesPage'
import AdminPage from './pages/AdminPage'
import AdminModelsPage from './pages/AdminModelsPage'
import AdminModelEditPage from './pages/AdminModelEditPage'
import AdminCategoriesPage from './pages/AdminCategoriesPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!useAuthStore.getState().isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}
function RequireAdmin({ children }: { children: React.ReactNode }) {
  if (!useAuthStore.getState().isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const load = useAuthStore(s => s.loadFromStorage)
  useEffect(() => { load() }, [load])

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/models/:id" element={<ModelDetailPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/favorites" element={<RequireAuth><FavoritesPage /></RequireAuth>} />
        <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        <Route path="/admin/models" element={<RequireAdmin><AdminModelsPage /></RequireAdmin>} />
        <Route path="/admin/models/new" element={<RequireAdmin><AdminModelEditPage /></RequireAdmin>} />
        <Route path="/admin/models/:id/edit" element={<RequireAdmin><AdminModelEditPage /></RequireAdmin>} />
        <Route path="/admin/categories" element={<RequireAdmin><AdminCategoriesPage /></RequireAdmin>} />
        <Route path="*" element={<div className="text-center py-20"><h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1><p className="text-gray-500">页面不存在</p></div>} />
      </Route>
    </Routes>
  )
}
