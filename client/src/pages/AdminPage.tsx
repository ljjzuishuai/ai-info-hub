import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { modelsApi, categoriesApi } from '../api/models'

export default function AdminPage() {
  const { data: models } = useQuery({ queryKey: ['models', 'admin'], queryFn: () => modelsApi.list({ pageSize: 1 }) })
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">🔧 管理后台</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-4xl font-bold text-indigo-600 mb-2">{models?.total || 0}</div>
          <div className="text-gray-500 text-sm mb-4">AI模型总数</div>
          <Link to="/admin/models" className="text-indigo-600 text-sm hover:text-indigo-700">管理模型 →</Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-4xl font-bold text-green-600 mb-2">{Array.isArray(categories) ? categories.length : 0}</div>
          <div className="text-gray-500 text-sm mb-4">分类数量</div>
          <Link to="/admin/categories" className="text-indigo-600 text-sm hover:text-indigo-700">管理分类 →</Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-4xl font-bold text-orange-600 mb-2">+</div>
          <div className="text-gray-500 text-sm mb-4">添加新模型</div>
          <Link to="/admin/models/new" className="text-indigo-600 text-sm hover:text-indigo-700">新建模型 →</Link>
        </div>
      </div>
    </div>
  )
}
