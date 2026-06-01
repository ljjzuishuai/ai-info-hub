import api from './client';
import type { AIModel, Category, Paginated } from '../types';

export const modelsApi = {
  list(params?: Record<string, any>) {
    return api.get<Paginated<AIModel>>('/models', { params }).then(r => r.data);
  },
  getById(id: number) {
    return api.get<AIModel>(`/models/${id}`).then(r => r.data);
  },
  create(data: Partial<AIModel>) {
    return api.post<AIModel>('/models', data).then(r => r.data);
  },
  update(id: number, data: Partial<AIModel>) {
    return api.put<AIModel>(`/models/${id}`, data).then(r => r.data);
  },
  delete(id: number) {
    return api.delete(`/models/${id}`);
  },
  compare(ids: number[]) {
    return api.post<AIModel[]>('/models/compare', { ids }).then(r => r.data);
  },
};

export const categoriesApi = {
  list() {
    return api.get<Category[]>('/categories').then(r => r.data);
  },
  create(data: Partial<Category>) {
    return api.post<Category>('/categories', data).then(r => r.data);
  },
  update(id: number, data: Partial<Category>) {
    return api.put(`/categories/${id}`, data);
  },
  delete(id: number) {
    return api.delete(`/categories/${id}`);
  },
};
