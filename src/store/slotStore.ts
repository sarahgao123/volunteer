import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Slot, SlotWithVolunteers } from '../types/slot';

interface SlotState {
  slots: SlotWithVolunteers[];
  loading: boolean;
  error: string | null;
  fetchSlots: (positionId: string) => Promise<void>;
  createSlot: (slot: Omit<Slot, 'id' | 'created_at' | 'volunteers_checked_in'>) => Promise<void>;
  updateSlot: (id: string, slot: Partial<Slot>) => Promise<void>;
  deleteSlot: (id: string) => Promise<void>;
  signUpForSlot: (slotId: string) => Promise<void>;
  checkInToSlot: (slotId: string) => Promise<void>;
}

export const useSlotStore = create<SlotState>((set, get) => ({
  // ... existing code ...

  checkInToSlot: async (slotId: string) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if the user is signed up for this slot
      const slot = get().slots.find(s => s.id === slotId);
      if (!slot) throw new Error('Slot not found');

      const isSignedUp = slot.volunteers.some(v => v.user.id === user.id);
      if (!isSignedUp) throw new Error('You are not signed up for this slot');

      // Update check-in status
      const { error } = await supabase
        .from('slot_volunteers')
        .update({ checked_in: true })
        .eq('slot_id', slotId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh slots
      const currentSlot = get().slots.find(s => s.id === slotId);
      if (currentSlot?.position_id) {
        await get().fetchSlots(currentSlot.position_id);
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));