import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  toggleAdminMode: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    user: null,
    loading: true,
    error: null,
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearAuth: () => set({ user: null, error: null }),
    toggleAdminMode: () => set((state) => ({
      user: state.user ? {
        ...state.user,
        role: state.user.role === 'admin' ? 'citizen' : 'admin'
      } : null
    }))
  }))
);
