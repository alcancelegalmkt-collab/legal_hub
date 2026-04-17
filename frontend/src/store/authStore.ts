import { create } from 'zustand';
import api from '../services/api';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, oabNumber: string, role: string) => Promise<void>;
  logout: () => void;
  loadProfile: () => Promise<void>;
  clearError: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.login(email, password);
      localStorage.setItem('token', response.token);
      set({
        user: response.user,
        token: response.token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (name, email, password, oabNumber, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.register(name, email, password, oabNumber, role);
      localStorage.setItem('token', response.token);
      set({
        user: response.user,
        token: response.token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
    });
  },

  loadProfile: async () => {
    set({ isLoading: true });
    try {
      const user = await api.getProfile();
      set({ user, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to load profile',
        isLoading: false,
        user: null,
        token: null,
      });
      localStorage.removeItem('token');
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
