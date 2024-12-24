import { User } from '@supabase/supabase-js';

export interface Slot {
  id: string;
  position_id: string;
  start_time: string;
  end_time: string;
  capacity: number;
  created_at: string;
  volunteers_checked_in: number;
}

export interface SlotWithVolunteers extends Slot {
  volunteers: Array<{
    user: Pick<User, 'id' | 'email'> & { created_at: string };
    checked_in: boolean;
  }>;
}