import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function AppLayout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-indigo-600">🤖 AI信息大全</Link>
            <Link to="/models" className="text-sm text-gray-600 hover:text-gray-900">全部模型</Link>
            {isAuthenticated && <Link to="/favorites" className="text-sm text-gray-600 hover:text-gray-900">我的收藏</Link>}
            {isAdmin && <Link to="/admin" className="text-sm text-orange-600 hover:text-orange-700 font-medium">管理后台</Link>}
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-500">{user?.username}</span>
                {isAdmin && <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">管理员</span>}
                <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-gray-400 hover:text-red-500">退出</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">登录</Link>
                <Link to="/register" className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">注册</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6"><Outlet /></main>
      <footer className="text-center py-8 text-gray-400 text-sm">AI信息大全 — 一站式了解所有AI大模型</footer>
    </div>
  )
}
