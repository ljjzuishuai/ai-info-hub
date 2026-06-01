import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const handle = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(email, password); navigate('/') }
    catch (err: any) { setError(err.response?.data?.error || '登录失败') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-3xl font-bold text-center mb-8">登录</h1>
      <form onSubmit={handle} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
        <div><label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required /></div>
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
          {loading ? '登录中...' : '登录'}</button>
        <p className="text-center text-sm text-gray-500">没有账号？<Link to="/register" className="text-indigo-600 ml-1">注册</Link></p>
      </form>
    </div>
  )
}
