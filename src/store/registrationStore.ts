import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Registration, DashboardStats } from '../types';

interface RegistrationState {
  registrations: Registration[];
  allRegistrations: Registration[];
  loading: boolean;
  error: string | null;
  fetchMyRegistrations: () => Promise<void>;
  fetchEventRegistrations: (eventId: string) => Promise<Registration[]>;
  fetchAllRegistrations: () => Promise<void>;
  registerForEvent: (eventId: string) => Promise<{ success: boolean; registrationId?: string }>;
  cancelRegistration: (id: string) => Promise<boolean>;
  updatePaymentStatus: (registrationId: string, status: 'paid' | 'failed', paymentId?: string) => Promise<boolean>;
  getDashboardStats: () => Promise<DashboardStats>;
  clearError: () => void;
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  registrations: [],
  allRegistrations: [],
  loading: false,
  error: null,

  fetchMyRegistrations: async () => {
    try {
      set({ loading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('registrations')
        .select('*, event:events(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ registrations: (data as Registration[]) || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchEventRegistrations: async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*, profile:profiles(*), event:events(*)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as Registration[]) || [];
    } catch (error: any) {
      set({ error: error.message });
      return [];
    }
  },

  fetchAllRegistrations: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('registrations')
        .select('*, profile:profiles(*), event:events(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ allRegistrations: (data as Registration[]) || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  registerForEvent: async (eventId: string) => {
    try {
      set({ loading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('registrations')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      const registration = data as Registration;
      set({ loading: false });
      await get().fetchMyRegistrations();
      return { success: true, registrationId: registration.id };
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return { success: false };
    }
  },

  cancelRegistration: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      set({ loading: false });
      await get().fetchMyRegistrations();
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  updatePaymentStatus: async (registrationId: string, status, paymentId) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({
          payment_status: status,
          payment_id: paymentId,
          status: status === 'paid' ? 'confirmed' : 'pending',
        })
        .eq('id', registrationId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    }
  },

  getDashboardStats: async () => {
    try {
      const { count: totalEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      const { count: totalRegistrations } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'paid');

      const { data: registrations } = await supabase
        .from('registrations')
        .select('*, event:events(price)')
        .eq('payment_status', 'paid');

      const totalRevenue = (registrations || []).reduce((sum: number, r: any) => {
        return sum + (r.event?.price || 0);
      }, 0);

      const { count: upcomingEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'upcoming');

      return {
        totalEvents: totalEvents || 0,
        totalRegistrations: totalRegistrations || 0,
        totalRevenue,
        upcomingEvents: upcomingEvents || 0,
      };
    } catch (error: any) {
      set({ error: error.message });
      return { totalEvents: 0, totalRegistrations: 0, totalRevenue: 0, upcomingEvents: 0 };
    }
  },

  clearError: () => set({ error: null }),
}));
