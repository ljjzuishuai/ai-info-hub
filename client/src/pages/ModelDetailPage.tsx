import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { modelsApi } from '../api/models'
import { favoritesApi } from '../api/favorites'
import { useAuthStore } from '../store/authStore'
import api from '../api/client'
import type { BenchmarkScore, Review } from '../types'

const PRICING_LABELS: Record<string, string> = { free: '免费', freemium: '部分免费', paid: '付费' }
const PCOLORS: Record<string, string> = { free: 'bg-green-100 text-green-700', freemium: 'bg-blue-100 text-blue-700', paid: 'bg-purple-100 text-purple-700' }

const BENCH_COLORS: Record<string, string> = {
  MMLU: 'bg-indigo-500', HumanEval: 'bg-green-500', MATH: 'bg-orange-500', GSM8K: 'bg-purple-500',
}

export default function ModelDetailPage() {
  const { id } = useParams<{ id: string }>()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const qc = useQueryClient()

  // 评价表单
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const { data: model, isLoading } = useQuery({
    queryKey: ['models', id], queryFn: () => modelsApi.getById(Number(id)), enabled: !!id,
  })
  const { data: benchmarks } = useQuery({
    queryKey: ['benchmarks', id], queryFn: async () => (await api.get(`/models/${id}/benchmarks`)).data as BenchmarkScore[], enabled: !!id,
  })
  const { data: reviews } = useQuery({
    queryKey: ['reviews', id], queryFn: async () => (await api.get(`/models/${id}/reviews`)).data as Review[], enabled: !!id,
  })
  const { data: favData } = useQuery({
    queryKey: ['favorites', 'check', id], queryFn: () => favoritesApi.check(Number(id)), enabled: !!id && isAuthenticated,
  })
  const favMut = useMutation({ mutationFn: () => favoritesApi.toggle(Number(id)), onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }) })
  const reviewMut = useMutation({
    mutationFn: () => api.post(`/models/${id}/reviews`, { rating, comment }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reviews', id] }); setComment(''); setRating(5); },
  })

  if (isLoading) return <div className="text-center py-20"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" /></div>
  if (!model) return <div className="text-center py-20 text-gray-400">模型不存在</div>

  const m = model as any
  const features: string[] = Array.isArray(m.features) ? m.features : []
  const bms = Array.isArray(benchmarks) ? benchmarks : []
  const revs = Array.isArray(reviews) ? reviews : []
  const favorited = favData?.favorited
  const avgRating = revs.length > 0 ? (revs.reduce((s, r) => s + r.rating, 0) / revs.length).toFixed(1) : '-'

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/models" className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">← 返回列表</Link>

      {/* 头部 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{m.category_icon || '📦'}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{m.name}</h1>
              <p className="text-gray-500">{m.name_en} · {m.provider}</p>
              <div className="flex gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${PCOLORS[m.pricing_type]}`}>{PRICING_LABELS[m.pricing_type]}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{m.access_type}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{m.category_name}</span>
                {avgRating !== '-' && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600">⭐ {avgRating}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isAuthenticated && (
              <button onClick={() => favMut.mutate()} className={`px-4 py-2 rounded-lg text-sm transition ${favorited ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'}`}>
                {favorited ? '⭐ 已收藏' : '☆ 收藏'}</button>
            )}
            {m.official_url && <a href={m.official_url} target="_blank" rel="noopener" className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">官网 →</a>}
            {m.access_url && <a href={m.access_url} target="_blank" rel="noopener" className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">访问 →</a>}
          </div>
        </div>

        <div className="mb-6"><h2 className="text-lg font-semibold text-gray-900 mb-2">简介</h2><p className="text-gray-700 leading-relaxed">{m.description}</p></div>
        <div className="mb-6"><h2 className="text-lg font-semibold text-gray-900 mb-3">特点</h2><div className="flex flex-wrap gap-2">{features.map((f: string, i: number) => <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm rounded-full">{f}</span>)}</div></div>
        <div className="mb-6"><h2 className="text-lg font-semibold text-gray-900 mb-2">主要用途</h2><p className="text-gray-700">{m.use_cases}</p></div>
        <div className="mb-6"><h2 className="text-lg font-semibold text-gray-900 mb-2">访问方式</h2><p className="text-gray-700">{m.access_type}{m.access_url && <a href={m.access_url} target="_blank" rel="noopener" className="text-indigo-600 text-sm hover:underline ml-2">{m.access_url}</a>}</p></div>
        <div className="bg-gray-50 rounded-xl p-5"><h2 className="text-lg font-semibold text-gray-900 mb-2">💰 收费信息</h2><pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{m.price_detail}</pre></div>
      </div>

      {/* 性能评分 */}
      {(m.context_window > 0 || bms.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📊 性能评分</h2>

          {/* 基准测试分数 */}
          {bms.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-4">基准测试分数</h3>
              <div className="space-y-3">
                {bms.map((b: BenchmarkScore) => (
                  <div key={b.id} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-gray-600 text-right shrink-0">{b.benchmark_name}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                      <div className={`h-full rounded-full text-white text-xs flex items-center pl-2 font-medium ${BENCH_COLORS[b.benchmark_name] || 'bg-blue-500'}`} style={{ width: `${b.score}%` }}>
                        {b.score.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 技术参数 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {m.context_window > 0 && (
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <div className="text-xs text-indigo-500 mb-1">上下文窗口</div>
                <div className="text-lg font-bold text-indigo-700">{m.context_window >= 1000000 ? `${(m.context_window/1000000).toFixed(1)}M` : m.context_window >= 1000 ? `${(m.context_window/1000).toFixed(0)}K` : m.context_window}</div>
              </div>
            )}
            {m.tokens_per_second > 0 && (
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-xs text-green-500 mb-1">生成速度</div>
                <div className="text-lg font-bold text-green-700">{m.tokens_per_second} t/s</div>
              </div>
            )}
            {m.avg_latency_ms > 0 && (
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <div className="text-xs text-orange-500 mb-1">平均延迟</div>
                <div className="text-lg font-bold text-orange-700">{m.avg_latency_ms < 1000 ? `${m.avg_latency_ms}ms` : `${(m.avg_latency_ms/1000).toFixed(1)}s`}</div>
              </div>
            )}
            {m.input_price > 0 && (
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <div className="text-xs text-purple-500 mb-1">API价格</div>
                <div className="text-lg font-bold text-purple-700">${m.input_price}/M</div>
              </div>
            )}
            {m.max_output_tokens > 0 && (
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-xs text-blue-500 mb-1">最大输出</div>
                <div className="text-lg font-bold text-blue-700">{m.max_output_tokens >= 1000 ? `${(m.max_output_tokens/1000).toFixed(0)}K` : m.max_output_tokens}</div>
              </div>
            )}
            {m.knowledge_cutoff && (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">知识截止</div>
                <div className="text-lg font-bold text-gray-700">{m.knowledge_cutoff}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 用户评价 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">💬 用户评价 {avgRating !== '-' && <span className="text-yellow-500 ml-2">⭐ {avgRating}</span>}</h2>
          <span className="text-sm text-gray-400">{revs.length} 条评价</span>
        </div>

        {/* 评价列表 */}
        {revs.length > 0 ? (
          <div className="space-y-4 mb-6">
            {revs.map((r: Review) => (
              <div key={r.id} className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">{r.username}</span>
                  <span className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                  <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-4 mb-4">暂无评价，来写第一条</p>
        )}

        {/* 写评价 */}
        {isAuthenticated ? (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">写评价</h3>
            <div className="flex items-center gap-1 mb-3">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)} className={`text-2xl transition ${s <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
              ))}
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 mb-2" placeholder="写下你的使用体验..." />
            <button onClick={() => reviewMut.mutate()} disabled={reviewMut.isPending} className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">{reviewMut.isPending ? '提交中...' : '提交评价'}</button>
          </div>
        ) : (
          <div className="border-t border-gray-100 pt-4 text-center">
            <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-700">登录后发表评价</Link>
          </div>
        )}
      </div>
    </div>
  )
}
