import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { modelsApi, categoriesApi } from '../api/models'
import type { AIModel, Category } from '../types'

const PRICING: Record<string, string> = { free: '免费', freemium: '部分免费', paid: '付费' }
const PCOLORS: Record<string, string> = { free: 'bg-green-100 text-green-700', freemium: 'bg-blue-100 text-blue-700', paid: 'bg-purple-100 text-purple-700' }

export default function ModelsPage() {
  const [sp, setSp] = useSearchParams()
  const navigate = useNavigate()
  const [compareIds, setCompareIds] = useState<number[]>([])

  const search = sp.get('search') || ''
  const categoryId = sp.get('categoryId') || ''
  const pricingType = sp.get('pricingType') || ''
  const sortBy = sp.get('sortBy') || 'featured'
  const page = parseInt(sp.get('page') || '1')

  const { data, isLoading } = useQuery({
    queryKey: ['models', search, categoryId, pricingType, sortBy, page],
    queryFn: () => modelsApi.list({ search: search || undefined, categoryId: categoryId || undefined, pricingType: pricingType || undefined, sortBy, page, pageSize: 12 }),
  })
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list })

  const updateFilter = (key: string, value: string) => {
    const p = new URLSearchParams(sp); p.delete('page')
    if (value) p.set(key, value); else p.delete(key)
    setSp(p)
  }

  const toggleCompare = (id: number) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">全部AI模型</h1>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <input type="text" value={search} onChange={e => updateFilter('search', e.target.value)}
          placeholder="搜索..." className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48 outline-none focus:ring-2 focus:ring-indigo-500" />
        <select value={categoryId} onChange={e => updateFilter('categoryId', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none">
          <option value="">全部分类</option>
          {Array.isArray(categories) && categories.map((c: Category) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select value={pricingType} onChange={e => updateFilter('pricingType', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none">
          <option value="">全部价格</option>
          <option value="free">免费</option><option value="freemium">部分免费</option><option value="paid">付费</option>
        </select>
        <select value={sortBy} onChange={e => updateFilter('sortBy', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none">
          <option value="featured">推荐排序</option><option value="newest">最新添加</option><option value="name">名称排序</option>
        </select>
        {compareIds.length >= 2 && (
          <button onClick={() => navigate(`/compare?ids=${compareIds.join(',')}`)}
            className="ml-auto px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">对比 ({compareIds.length})</button>
        )}
      </div>

      {/* 列表 */}
      {isLoading ? (
        <div className="text-center py-20"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" /></div>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((m: AIModel) => {
              const features = Array.isArray(m.features) ? m.features : []
              const checked = compareIds.includes(m.id)
              return (
                <div key={m.id} className={`relative bg-white rounded-xl border-2 p-5 hover:shadow-lg transition cursor-pointer ${checked ? 'border-indigo-400 shadow-md' : 'border-gray-200 hover:border-indigo-200'}`}>
                  <label className="absolute top-3 right-3 flex items-center gap-2 cursor-pointer" onClick={e => e.stopPropagation()}>
                    <span className="text-xs text-gray-400">对比</span>
                    <input type="checkbox" checked={checked} onChange={() => toggleCompare(m.id)} className="w-4 h-4 accent-indigo-600" />
                  </label>
                  <Link to={`/models/${m.id}`}>
                    <div className="flex items-start gap-2 mb-2 pr-16">
                      <span className="text-2xl">{m.category_icon || '📦'}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 hover:text-indigo-600">{m.name}</h3>
                        <p className="text-xs text-gray-400">{m.provider} · {m.name_en}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{m.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {features.slice(0, 3).map((f, i) => <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full">{f}</span>)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${PCOLORS[m.pricing_type] || ''}`}>{PRICING[m.pricing_type]}</span>
                      <span className="text-xs text-gray-400">{m.access_type}</span>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
          {data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => { const np = new URLSearchParams(sp); np.set('page', String(p)); setSp(np); }}
                  className={`px-3 py-1.5 rounded-lg text-sm ${p === page ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>{p}</button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🔍</div><p>没有找到匹配的模型</p>
        </div>
      )}
    </div>
  )
}
