import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { favoritesApi } from '../api/favorites'
import type { AIModel } from '../types'

export default function FavoritesPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['favorites'], queryFn: favoritesApi.list })
  const removeMut = useMutation({
    mutationFn: (id: number) => favoritesApi.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">⭐ 我的收藏</h1>
      {isLoading ? (
        <div className="text-center py-20"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" /></div>
      ) : data && data.length > 0 ? (
        <div className="space-y-3">
          {(data as AIModel[]).map(m => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:border-indigo-200 transition">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.category_icon || '📦'}</span>
                <div>
                  <Link to={`/models/${m.id}`} className="font-medium text-gray-900 hover:text-indigo-600">{m.name}</Link>
                  <p className="text-xs text-gray-400">{m.provider} · {m.name_en}</p>
                </div>
              </div>
              <button onClick={() => removeMut.mutate(m.id)} className="text-sm text-red-400 hover:text-red-600">取消收藏</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">⭐</div>
          <p className="text-gray-400 mb-4">还没有收藏任何模型</p>
          <Link to="/models" className="text-indigo-600 hover:text-indigo-700 text-sm">去浏览 →</Link>
        </div>
      )}
    </div>
  )
}
