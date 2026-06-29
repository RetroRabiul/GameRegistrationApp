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
  registerForEvent: (eventId: string) => Promise<{ success: boolean; registrationId?: string; slotNumber?: number | null; message?: string }>;
  cancelRegistration: (id: string) => Promise<boolean>;
  submitTransactionId: (registrationId: string, transactionId: string) => Promise<{ success: boolean; message?: string }>;
  adminVerifyPayment: (registrationId: string, action: 'approve' | 'reject') => Promise<{ success: boolean; message?: string }>;
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
        .order('slot_number', { ascending: true, nullsFirst: false });

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

      const { data, error } = await supabase.rpc('register_for_event', {
        p_event_id: eventId,
      });

      if (error) throw error;

      if (!data?.success) {
        set({ error: data?.error || 'Registration failed', loading: false });
        return { success: false, message: data?.error };
      }

      const registration = data.registration as Registration;
      set({ loading: false });
      await get().fetchMyRegistrations();
      return {
        success: true,
        registrationId: registration.id,
        slotNumber: registration.slot_number,
        message: `You got Slot #${registration.slot_number}!`,
      };
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.message };
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

  submitTransactionId: async (registrationId, transactionId) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.rpc('submit_payment_transaction', {
        p_registration_id: registrationId,
        p_transaction_id: transactionId,
      });

      if (error) throw error;

      set({ loading: false });
      await get().fetchMyRegistrations();

      if (data?.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data?.error || 'Failed to submit transaction ID' };
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.message };
    }
  },

  adminVerifyPayment: async (registrationId, action) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.rpc('admin_verify_payment', {
        p_registration_id: registrationId,
        p_action: action,
      });

      if (error) throw error;

      set({ loading: false });

      if (data?.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data?.error || 'Failed to verify payment' };
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return { success: false, message: error.message };
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
