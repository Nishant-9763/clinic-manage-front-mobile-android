import { create } from 'zustand';
import { Doctor } from '../services/types';
import { loadLocalDb, saveLocalDb } from '../services/mockDb';

interface AuthState {
  doctor: Doctor | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<Doctor>) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  doctor: null,
  isAuthenticated: false,
  isLoading: true,

  initializeAuth: async () => {
    const db = await loadLocalDb();
    set({
      doctor: db.doctor,
      isAuthenticated: true, // Auto-login for demo MVP experience
      isLoading: false,
    });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    const db = await loadLocalDb();
    
    const updatedDoctor = { ...db.doctor, email };
    db.doctor = updatedDoctor;
    await saveLocalDb(db);

    set({
      doctor: updatedDoctor,
      isAuthenticated: true,
      isLoading: false,
    });
    return true;
  },

  logout: () => {
    set({
      doctor: null,
      isAuthenticated: false,
    });
  },

  updateProfile: async (profile) => {
    const currentDoctor = get().doctor;
    if (!currentDoctor) return;

    const updated = { ...currentDoctor, ...profile };
    set({ doctor: updated });

    const db = await loadLocalDb();
    db.doctor = updated;
    await saveLocalDb(db);
  },
}));
