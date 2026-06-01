import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { modelsApi, categoriesApi } from '../api/models'
import type { AIModel, Category } from '../types'

const PRICING_COLORS: Record<string, string> = { free: 'bg-green-100 text-green-700', freemium: 'bg-blue-100 text-blue-700', paid: 'bg-purple-100 text-purple-700' }
const PRICING_LABELS: Record<string, string> = { free: '免费', freemium: '部分免费', paid: '付费' }

function ModelCard({ model }: { model: AIModel }) {
  const features = Array.isArray(model.features) ? model.features : []
  return (
    <Link to={`/models/${model.id}`} className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-indigo-200 transition group">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-lg mr-2">{model.category_icon || '📦'}</span>
          <h3 className="font-semibold text-gray-900 inline group-hover:text-indigo-600 transition">{model.name}</h3>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${PRICING_COLORS[model.pricing_type] || 'bg-gray-100 text-gray-600'}`}>
          {PRICING_LABELS[model.pricing_type] || model.pricing_type}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-2">{model.provider}</p>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{model.description}</p>
      <div className="flex flex-wrap gap-1">
        {features.slice(0, 3).map((f, i) => (
          <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full">{f}</span>
        ))}
        {features.length > 3 && <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-xs rounded-full">+{features.length - 3}</span>}
      </div>
    </Link>
  )
}

export default function HomePage() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list })
  const { data: featured } = useQuery({
    queryKey: ['models', 'featured'],
    queryFn: () => modelsApi.list({ pageSize: 6, sortBy: 'featured' }),
  })
  const { data: freeModels } = useQuery({
    queryKey: ['models', 'free'],
    queryFn: () => modelsApi.list({ pricingType: 'free', pageSize: 6 }),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) navigate(`/models?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div>
      {/* Hero搜索区 */}
      <div className="text-center py-12 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">AI大模型信息大全</h1>
        <p className="text-gray-500 mb-8">一站式了解 GPT、Claude、Gemini、DeepSeek、Midjourney 等所有主流AI模型</p>
        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索AI模型名称、公司、功能..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white shadow-sm" />
          <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium shadow-sm">搜索</button>
        </form>
      </div>

      {/* 分类导航 */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4">按分类浏览</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.isArray(categories) && categories.map((cat: Category) => (
            <Link key={cat.id} to={`/models?categoryId=${cat.id}`}
              className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-indigo-300 hover:shadow-md transition group">
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">{cat.name}</div>
              <div className="text-xs text-gray-400 mt-1">{cat.model_count || 0} 个模型</div>
            </Link>
          ))}
        </div>
      </div>

      {/* 推荐模型 */}
      {featured && featured.data.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">🔥 推荐模型</h2>
            <Link to="/models" className="text-sm text-indigo-600 hover:text-indigo-700">查看全部 →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.data.map(m => <ModelCard key={m.id} model={m} />)}
          </div>
        </div>
      )}

      {/* 免费模型 */}
      {freeModels && freeModels.data.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">🆓 免费模型</h2>
            <Link to="/models?pricingType=free" className="text-sm text-indigo-600 hover:text-indigo-700">查看全部 →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {freeModels.data.map(m => <ModelCard key={m.id} model={m} />)}
          </div>
        </div>
      )}

      {/* 统计总览 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-3xl font-bold text-indigo-600">29+</div>
          <div className="text-sm text-gray-500 mt-1">收录AI模型</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-3xl font-bold text-green-600">7</div>
          <div className="text-sm text-gray-500 mt-1">模型分类</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-3xl font-bold text-orange-600">持续更新</div>
          <div className="text-sm text-gray-500 mt-1">保持最新</div>
        </div>
      </div>
    </div>
  )
}
