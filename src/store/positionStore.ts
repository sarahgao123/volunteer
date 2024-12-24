import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Position, PositionWithVolunteers } from '../types/position';

interface PositionState {
  positions: PositionWithVolunteers[];
  loading: boolean;
  error: string | null;
  fetchPositions: (eventId: string) => Promise<void>;
  createPosition: (position: Omit<Position, 'id' | 'created_at' | 'volunteers_checked_in'>) => Promise<void>;
  updatePosition: (id: string, position: Partial<Position>) => Promise<void>;
  deletePosition: (id: string) => Promise<void>;
}

export const usePositionStore = create<PositionState>((set, get) => ({
  positions: [],
  loading: false,
  error: null,

  fetchPositions: async (eventId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('position_details')
        .select('*')
        .eq('event_id', eventId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      set({ positions: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createPosition: async (position) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('positions')
        .insert([{
          ...position,
          volunteers_checked_in: 0
        }]);
      
      if (error) throw error;
      await get().fetchPositions(position.event_id);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updatePosition: async (id, position) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('positions')
        .update(position)
        .eq('id', id);
      
      if (error) throw error;

      // Find the position to get the event_id
      const currentPosition = get().positions.find(p => p.id === id);
      if (currentPosition?.event_id) {
        await get().fetchPositions(currentPosition.event_id);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deletePosition: async (id) => {
    set({ loading: true, error: null });
    try {
      // Find the position to get the event_id before deletion
      const position = get().positions.find(p => p.id === id);
      if (!position) throw new Error('Position not found');

      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      // Refresh positions after deletion
      await get().fetchPositions(position.event_id);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));