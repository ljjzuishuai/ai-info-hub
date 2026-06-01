import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { modelsApi } from '../api/models'
import api from '../api/client'
import type { BenchmarkScore } from '../types'

const P_LABEL: Record<string, string> = { free: '免费 🟢', freemium: '部分免费 🔵', paid: '付费 🟣' }

export default function ComparePage() {
  const [sp] = useSearchParams()
  const ids = (sp.get('ids') || '').split(',').map(Number).filter(Boolean)
  const [tab, setTab] = useState<'info' | 'perf'>('info')

  const { data: models, isLoading } = useQuery({
    queryKey: ['compare', ids.join(',')],
    queryFn: () => modelsApi.compare(ids), enabled: ids.length >= 2,
  })

  const { data: perfData } = useQuery({
    queryKey: ['perf-compare', ids.join(',')],
    queryFn: async () => (await api.get('/models/performance-compare', { params: { ids: ids.join(',') } })).data,
    enabled: ids.length >= 2,
  })

  if (ids.length < 2) return <div className="text-center py-20 text-gray-400">请至少选择2个模型进行对比</div>

  const modelsArr: any[] = Array.isArray(models) ? models : []
  const perfArr: any[] = Array.isArray(perfData) ? perfData : []

  const infoRows = [
    { label: '所属公司', key: 'provider' },
    { label: '分类', key: 'category_name', render: (m: any) => `${m.category_icon || ''} ${m.category_name || '-'}` },
    { label: '收费类型', key: 'pricing_type', render: (m: any) => P_LABEL[m.pricing_type] || m.pricing_type },
    { label: '访问方式', key: 'access_type' },
    { label: '特点', key: 'features', render: (m: any) => { const f: string[] = Array.isArray(m.features) ? m.features : []; return <div className="flex flex-wrap gap-1">{f.map((x: string, i: number) => <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full">{x}</span>)}</div> }},
    { label: '主要用途', key: 'use_cases', wide: true },
    { label: '价格详情', key: 'price_detail', render: (m: any) => <pre className="whitespace-pre-wrap text-xs font-sans">{m.price_detail}</pre>, wide: true },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">模型对比 ({ids.length}个)</h1>
        <Link to="/models" className="text-sm text-indigo-600 hover:text-indigo-700">← 返回列表</Link>
      </div>

      {/* 标签切换 */}
      <div className="flex gap-4 mb-4 border-b border-gray-200">
        {(['info','perf'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition ${tab===t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'info' ? '📋 基本信息' : '📊 性能对比'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-20"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" /></div>
      ) : modelsArr.length > 0 ? (
        <div className="overflow-x-auto">
          {tab === 'info' ? (
            <table className="w-full bg-white rounded-xl border border-gray-200">
              <thead><tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 w-24">对比项</th>
                {modelsArr.map((m: any) => (
                  <th key={m.id} className="px-4 py-3 text-center min-w-[200px]">
                    <Link to={`/models/${m.id}`} className="font-semibold text-gray-900 hover:text-indigo-600">{m.name}</Link>
                    <p className="text-xs text-gray-400 font-normal">{m.provider}</p>
                  </th>
                ))}
              </tr></thead>
              <tbody>
                <tr className="border-b border-gray-100"><td className="px-4 py-3 text-sm font-medium text-gray-500">简介</td>{modelsArr.map((m: any) => <td key={m.id} className="px-4 py-3 text-sm text-gray-700">{m.description}</td>)}</tr>
                {infoRows.map(row => (
                  <tr key={row.key} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm font-medium text-gray-500 align-top">{row.label}</td>
                    {modelsArr.map((m: any) => (<td key={m.id} className={`px-4 py-3 text-sm text-gray-700 align-top ${row.wide?'':'text-center'}`}>{row.render ? row.render(m) : m[row.key] || '-'}</td>))}
                  </tr>
                ))}
                <tr className="border-b border-gray-100"><td className="px-4 py-3 text-sm font-medium text-gray-500">链接</td>
                  {modelsArr.map((m: any) => (<td key={m.id} className="px-4 py-3 text-center"><div className="flex gap-2 justify-center">{m.official_url && <a href={m.official_url} target="_blank" rel="noopener" className="text-xs text-indigo-600 hover:underline">官网</a>}{m.access_url && <a href={m.access_url} target="_blank" rel="noopener" className="text-xs text-green-600 hover:underline">访问</a>}</div></td>))}
                </tr>
              </tbody>
            </table>
          ) : (
            /* 性能对比标签 */
            <table className="w-full bg-white rounded-xl border border-gray-200">
              <thead><tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 w-28">性能指标</th>
                {perfArr.map((m: any) => (<th key={m.id} className="px-4 py-3 text-center min-w-[180px]"><Link to={`/models/${m.id}`} className="font-semibold text-gray-900 hover:text-indigo-600">{m.name}</Link></th>))}
              </tr></thead>
              <tbody>
                <tr className="border-b border-gray-100"><td className="px-4 py-3 text-sm font-medium text-gray-500">上下文窗口</td>
                  {perfArr.map((m: any) => <td key={m.id} className="px-4 py-3 text-center text-sm font-bold text-gray-700">{m.context_window > 0 ? (m.context_window >= 1000000 ? `${(m.context_window/1000000).toFixed(1)}M` : `${(m.context_window/1000).toFixed(0)}K`) : '-'}</td>)}</tr>
                <tr className="border-b border-gray-100"><td className="px-4 py-3 text-sm font-medium text-gray-500">最大输出</td>
                  {perfArr.map((m: any) => <td key={m.id} className="px-4 py-3 text-center text-sm text-gray-700">{m.max_output_tokens > 0 ? `${(m.max_output_tokens/1000).toFixed(0)}K` : '-'}</td>)}</tr>
                <tr className="border-b border-gray-100"><td className="px-4 py-3 text-sm font-medium text-gray-500">API输入价</td>
                  {perfArr.map((m: any) => <td key={m.id} className="px-4 py-3 text-center text-sm text-gray-700">{m.input_price > 0 ? `$${m.input_price}/M` : '-'}</td>)}</tr>
                <tr className="border-b border-gray-100"><td className="px-4 py-3 text-sm font-medium text-gray-500">API输出价</td>
                  {perfArr.map((m: any) => <td key={m.id} className="px-4 py-3 text-center text-sm text-gray-700">{m.output_price > 0 ? `$${m.output_price}/M` : '-'}</td>)}</tr>
                <tr className="border-b border-gray-100"><td className="px-4 py-3 text-sm font-medium text-gray-500">生成速度</td>
                  {perfArr.map((m: any) => <td key={m.id} className="px-4 py-3 text-center text-sm text-gray-700">{m.tokens_per_second > 0 ? `${m.tokens_per_second} t/s` : '-'}</td>)}</tr>
                <tr className="border-b border-gray-100"><td className="px-4 py-3 text-sm font-medium text-gray-500">平均延迟</td>
                  {perfArr.map((m: any) => <td key={m.id} className="px-4 py-3 text-center text-sm text-gray-700">{m.avg_latency_ms > 0 ? `${m.avg_latency_ms}ms` : '-'}</td>)}</tr>
                <tr className="border-b border-gray-100"><td className="px-4 py-3 text-sm font-medium text-gray-500">知识截止</td>
                  {perfArr.map((m: any) => <td key={m.id} className="px-4 py-3 text-center text-sm text-gray-700">{m.knowledge_cutoff || '-'}</td>)}</tr>
                {/* 基准分数 */}
                {['MMLU','HumanEval','MATH','GSM8K'].map(bm => (
                  <tr key={bm} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm font-medium text-gray-500">{bm}</td>
                    {perfArr.map((m: any) => {
                      const b = (m.benchmarks || []).find((x: BenchmarkScore) => x.benchmark_name === bm)
                      return <td key={m.id} className="px-4 py-3 text-center text-sm font-bold text-gray-700">{b ? b.score.toFixed(1) : '-'}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}
    </div>
  )
}
