import { create } from 'zustand';
import type { User } from '../types';
import { authApi } from '../api/auth';

interface AuthState {
  user: User | null; token: string | null; isAuthenticated: boolean; isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, token: localStorage.getItem('token'), isAuthenticated: !!localStorage.getItem('token'),
  isAdmin: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' : false,

  login: async (email, password) => {
    const data = await authApi.login({ email, password });
    const { token, ...user } = data;
    localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user));
    set({ user: user as User, token, isAuthenticated: true, isAdmin: user.role === 'admin' });
  },
  register: async (username, email, password) => {
    const data = await authApi.register({ username, email, password });
    const { token, ...user } = data;
    localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user));
    set({ user: user as User, token, isAuthenticated: true, isAdmin: user.role === 'admin' });
  },
  logout: () => {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false, isAdmin: false });
  },
  loadFromStorage: () => {
    const t = localStorage.getItem('token'); const u = localStorage.getItem('user');
    if (t && u) { try { const user = JSON.parse(u); set({ user, token: t, isAuthenticated: true, isAdmin: user.role === 'admin' }); } catch {} }
  },
}));
