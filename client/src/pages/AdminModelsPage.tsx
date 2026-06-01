import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { modelsApi } from '../api/models'
import type { AIModel } from '../types'

export default function AdminModelsPage() {
  const [search, setSearch] = useState('')
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['models', 'admin', search],
    queryFn: () => modelsApi.list({ search: search || undefined, pageSize: 100, sortBy: 'newest' }),
  })

  const delMut = useMutation({
    mutationFn: modelsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['models'] }),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">模型管理</h1>
        <Link to="/admin/models/new" className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ 新建模型</Link>
      </div>
      <input type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="搜索模型..." className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-64 mb-4 outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
      {isLoading ? (
        <div className="text-center py-10"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full"><thead><tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">ID</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">名称</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">公司</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">分类</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">收费</th>
            <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">操作</th>
          </tr></thead><tbody>
            {data?.data.map((m: AIModel) => (
              <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500">{m.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{m.provider}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{m.category_name || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{m.pricing_type}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => navigate(`/admin/models/${m.id}/edit`)} className="text-indigo-600 text-sm hover:text-indigo-700 mr-3">编辑</button>
                  <button onClick={() => { if (confirm(`确定删除「${m.name}」？`)) delMut.mutate(m.id) }} className="text-red-400 text-sm hover:text-red-600">删除</button>
                </td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}
      <div className="mt-4"><Link to="/admin" className="text-sm text-gray-400 hover:text-gray-600">← 返回管理后台</Link></div>
    </div>
  )
}
