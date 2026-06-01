import api from './client';
import type { User } from '../types';

export const authApi = {
  register(data: { username: string; email: string; password: string }) {
    return api.post<{ token: string } & User>('/auth/register', data).then(r => r.data);
  },
  login(data: { email: string; password: string }) {
    return api.post<{ token: string } & User>('/auth/login', data).then(r => r.data);
  },
  me() {
    return api.get<{ user: User }>('/auth/me').then(r => r.data.user);
  },
};
