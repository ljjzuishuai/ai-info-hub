import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const register = useAuthStore(s => s.register)
  const navigate = useNavigate()

  const handle = async (e: FormEvent) => {
    e.preventDefault(); setError('')
    if (username.length < 3) { setError('用户名至少3个字符'); return }
    if (password.length < 6) { setError('密码至少6个字符'); return }
    setLoading(true)
    try { await register(username, email, password); navigate('/') }
    catch (err: any) { setError(err.response?.data?.error || '注册失败') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-3xl font-bold text-center mb-8">注册</h1>
      <form onSubmit={handle} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}
        <div><label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required minLength={3} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required minLength={6} /></div>
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
          {loading ? '注册中...' : '注册'}</button>
        <p className="text-center text-sm text-gray-500">已有账号？<Link to="/login" className="text-indigo-600 ml-1">登录</Link></p>
      </form>
    </div>
  )
}
