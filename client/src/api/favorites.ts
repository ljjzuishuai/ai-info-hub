import api from './client';
import type { AIModel } from '../types';

export const favoritesApi = {
  list() {
    return api.get<AIModel[]>('/favorites').then(r => r.data);
  },
  toggle(modelId: number) {
    return api.post<{ favorited: boolean }>(`/favorites/${modelId}`).then(r => r.data);
  },
  check(modelId: number) {
    return api.get<{ favorited: boolean }>(`/favorites/check/${modelId}`).then(r => r.data);
  },
};
