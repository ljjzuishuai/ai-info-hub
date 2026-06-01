import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { modelsApi, categoriesApi } from '../api/models'
import type { AIModel, Category } from '../types'

const defaultForm = {
  name: '', name_en: '', provider: '', category_id: 0, description: '', features: '',
  use_cases: '', access_url: '', access_type: '网页', pricing_type: 'paid', price_detail: '',
  logo_url: '', official_url: '', is_featured: 0, sort_order: 0,
  context_window: 0, max_output_tokens: 0, input_price: 0, output_price: 0,
  avg_latency_ms: 0, tokens_per_second: 0, knowledge_cutoff: '',
}

export default function AdminModelEditPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState('')

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list })
  const { data: model } = useQuery({
    queryKey: ['models', id], queryFn: () => modelsApi.getById(Number(id)), enabled: !isNew,
  })

  useEffect(() => {
    if (model && !isNew) {
      const m = model as AIModel & Record<string, any>
      setForm({
        name: m.name, name_en: m.name_en || '', provider: m.provider, category_id: m.category_id || 0,
        description: m.description || '', features: Array.isArray(m.features) ? m.features.join('\n') : '',
        use_cases: m.use_cases || '', access_url: m.access_url || '', access_type: m.access_type || '网页',
        pricing_type: m.pricing_type || 'paid', price_detail: m.price_detail || '',
        logo_url: m.logo_url || '', official_url: m.official_url || '', is_featured: m.is_featured || 0, sort_order: m.sort_order || 0,
        context_window: m.context_window || 0, max_output_tokens: m.max_output_tokens || 0,
        input_price: m.input_price || 0, output_price: m.output_price || 0,
        avg_latency_ms: m.avg_latency_ms || 0, tokens_per_second: m.tokens_per_second || 0, knowledge_cutoff: m.knowledge_cutoff || '',
      })
    }
  }, [model, isNew])

  const mut = useMutation({
    mutationFn: (data: any) => isNew ? modelsApi.create(data) : modelsApi.update(Number(id), data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['models'] }); navigate('/admin/models') },
    onError: (err: any) => setError(err.response?.data?.error || '保存失败'),
  })

  const handle = (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!form.name || !form.provider) { setError('名称和所属公司为必填'); return }
    mut.mutate({
      ...form,
      category_id: form.category_id || undefined,
      features: JSON.stringify(form.features.split('\n').filter(Boolean)),
      is_featured: Number(form.is_featured), sort_order: Number(form.sort_order),
      context_window: Number(form.context_window), max_output_tokens: Number(form.max_output_tokens),
      input_price: Number(form.input_price), output_price: Number(form.output_price),
      avg_latency_ms: Number(form.avg_latency_ms), tokens_per_second: Number(form.tokens_per_second),
    })
  }

  const f = (key: string) => (form as any)[key]
  const s = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isNew ? '新建AI模型' : '编辑AI模型'}</h1>
      <form onSubmit={handle} className="space-y-6">
        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

        {/* 基本信息 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-4">基本信息</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">名称 *</label><input value={f('name')} onChange={e => s('name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">英文名</label><input value={f('name_en')} onChange={e => s('name_en', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">所属公司 *</label><input value={f('provider')} onChange={e => s('provider', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">分类</label><select value={f('category_id')} onChange={e => s('category_id', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none"><option value="0">选择</option>{Array.isArray(categories) && categories.map((c: Category) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">访问方式</label><input value={f('access_type')} onChange={e => s('access_type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">收费类型</label><select value={f('pricing_type')} onChange={e => s('pricing_type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none"><option value="free">免费</option><option value="freemium">部分免费</option><option value="paid">付费</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">推荐</label><select value={f('is_featured')} onChange={e => s('is_featured', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none"><option value="0">否</option><option value="1">是</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">排序</label><input type="number" value={f('sort_order')} onChange={e => s('sort_order', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" /></div>
          </div>
          <div className="mt-3"><label className="block text-sm font-medium text-gray-700 mb-1">访问地址</label><input value={f('access_url')} onChange={e => s('access_url', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div className="mt-3"><label className="block text-sm font-medium text-gray-700 mb-1">官网地址</label><input value={f('official_url')} onChange={e => s('official_url', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div className="mt-3"><label className="block text-sm font-medium text-gray-700 mb-1">简介</label><textarea value={f('description')} onChange={e => s('description', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div className="mt-3"><label className="block text-sm font-medium text-gray-700 mb-1">特点（每行一个）</label><textarea value={f('features')} onChange={e => s('features', e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div className="mt-3"><label className="block text-sm font-medium text-gray-700 mb-1">主要用途</label><input value={f('use_cases')} onChange={e => s('use_cases', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
          <div className="mt-3"><label className="block text-sm font-medium text-gray-700 mb-1">价格详情</label><textarea value={f('price_detail')} onChange={e => s('price_detail', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
        </div>

        {/* 性能参数 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-4">📊 性能参数</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">上下文窗口</label><input type="number" value={f('context_window')} onChange={e => s('context_window', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="128000" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">最大输出Token</label><input type="number" value={f('max_output_tokens')} onChange={e => s('max_output_tokens', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="4096" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">输入价格($/M)</label><input type="number" step="0.01" value={f('input_price')} onChange={e => s('input_price', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="2.5" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">输出价格($/M)</label><input type="number" step="0.01" value={f('output_price')} onChange={e => s('output_price', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="10" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">平均延迟(ms)</label><input type="number" value={f('avg_latency_ms')} onChange={e => s('avg_latency_ms', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="1200" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">生成速度(t/s)</label><input type="number" value={f('tokens_per_second')} onChange={e => s('tokens_per_second', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="80" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">知识截止日期</label><input value={f('knowledge_cutoff')} onChange={e => s('knowledge_cutoff', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="2024-12" /></div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={mut.isPending} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">{mut.isPending ? '保存中...' : '保存'}</button>
          <Link to="/admin/models" className="px-6 py-2.5 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">取消</Link>
        </div>
      </form>
    </div>
  )
}
