import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { GameEvent } from '../types';
import { notificationService } from '../lib/notifications';

interface EventState {
  events: GameEvent[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<GameEvent | null>;
  createEvent: (event: Omit<GameEvent, 'id' | 'created_at' | 'filled_slots'>) => Promise<boolean>;
  updateEvent: (id: string, updates: Partial<GameEvent>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  loading: false,
  error: null,

  fetchEvents: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      set({ events: (data as GameEvent[]) || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchEventById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as GameEvent;
    } catch (error: any) {
      set({ error: error.message });
      return null;
    }
  },

  createEvent: async (event) => {
    try {
      set({ loading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('events')
        .insert({ ...event, created_by: user.id });

      if (error) throw error;
      set({ loading: false });
      await get().fetchEvents();
      
      // Send notification
      await notificationService.sendLocalNotification(
        'New Event Created!',
        `${event.title} has been created. Check it out!`,
        { type: 'event_created', eventId: event.title }
      );
      
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  updateEvent: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      set({ loading: false });
      await get().fetchEvents();
      
      // Send notification if status changed
      if (updates.status) {
        await notificationService.sendLocalNotification(
          'Event Updated',
          `Event status changed to ${updates.status}.`,
          { type: 'event_updated', status: updates.status }
        );
      }
      
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  deleteEvent: async (id) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set({ loading: false });
      await get().fetchEvents();
      return true;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
