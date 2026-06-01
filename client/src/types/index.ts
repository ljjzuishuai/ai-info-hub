export interface AIModel {
  id: number; name: string; name_en: string; provider: string;
  category_id: number; description: string; features: string[];
  use_cases: string; access_url: string; access_type: string;
  pricing_type: 'free' | 'freemium' | 'paid'; price_detail: string;
  logo_url: string; official_url: string; is_featured: number;
  sort_order: number;
  context_window: number; max_output_tokens: number;
  input_price: number; output_price: number;
  avg_latency_ms: number; tokens_per_second: number; knowledge_cutoff: string;
  created_at: string; updated_at: string;
  category_name?: string; category_icon?: string; category_slug?: string;
  benchmarks?: BenchmarkScore[];
}

export interface BenchmarkScore {
  id: number; model_id: number; benchmark_name: string; score: number;
}

export interface Review {
  id: number; user_id: number; model_id: number;
  rating: number; comment: string; username: string; created_at: string;
}

export interface Category {
  id: number; name: string; slug: string; icon: string;
  sort_order: number; model_count?: number;
}

export interface User {
  id: number; username: string; email: string; role: string; created_at: string;
}

export interface Paginated<T> { data: T[]; total: number; page: number; pageSize: number; totalPages: number; }
