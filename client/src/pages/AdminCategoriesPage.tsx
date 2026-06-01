import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '../api/models'
import type { Category } from '../types'

export default function AdminCategoriesPage() {
  const qc = useQueryClient()
  const [showNew, setShowNew] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', slug: '', icon: '📦' })

  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list })

  const createMut = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setShowNew(false); setNewCat({ name: '', slug: '', icon: '📦' }) },
  })

  const delMut = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
        <button onClick={() => setShowNew(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ 新建分类</button>
      </div>

      {showNew && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-3 items-end">
          <div><label className="block text-xs text-gray-500 mb-1">图标</label><input value={newCat.icon} onChange={e => setNewCat(p => ({ ...p, icon: e.target.value }))} className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm text-center" /></div>
          <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">名称</label><input value={newCat.name} onChange={e => setNewCat(p => ({ ...p, name: e.target.value, slug: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" /></div>
          <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Slug</label><input value={newCat.slug} onChange={e => setNewCat(p => ({ ...p, slug: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" /></div>
          <button onClick={() => createMut.mutate(newCat)} className="px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700">保存</button>
          <button onClick={() => setShowNew(false)} className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700">取消</button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" /></div>
      ) : (
        <div className="space-y-2">
          {Array.isArray(data) && data.map((cat: Category) => (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <span className="font-medium text-gray-900">{cat.name}</span>
                  <span className="text-xs text-gray-400 ml-2">/{cat.slug}</span>
                </div>
                <span className="text-xs text-gray-400 ml-2">{cat.model_count || 0} 个模型</span>
              </div>
              <button onClick={() => { if (confirm(`确定删除分类「${cat.name}」？`)) delMut.mutate(cat.id) }} className="text-sm text-red-400 hover:text-red-600">删除</button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4"><Link to="/admin" className="text-sm text-gray-400 hover:text-gray-600">← 返回管理后台</Link></div>
    </div>
  )
}
