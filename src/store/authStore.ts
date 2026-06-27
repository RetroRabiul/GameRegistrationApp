import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Profile, UserRole } from '../types';

interface AuthState {
  user: Profile | null;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await get().fetchProfile(session.user.id);
      } else {
        set({ user: null, loading: false });
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await get().fetchProfile(session.user.id);
        } else {
          set({ user: null, loading: false });
        }
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      set({ user: data as Profile, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  signUp: async (email: string, password: string, fullName: string, phone: string) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: 'player' },
        },
      });

      if (error) throw error;

      if (phone) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ phone })
            .eq('id', user.id);
        }
      }

      set({ loading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      set({ loading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
