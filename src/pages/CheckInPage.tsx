import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

interface Position {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface Slot {
  id: string;
  start_time: string;
  end_time: string;
  volunteers: Array<{
    user: { email: string };
    checked_in: boolean;
  }>;
}

export function CheckInPage() {
  const { positionId } = useParams<{ positionId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [email, setEmail] = useState('');
  const [checkInStatus, setCheckInStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch position details
        const { data: positionData, error: positionError } = await supabase
          .from('positions')
          .select('*')
          .eq('id', positionId)
          .single();

        if (positionError) throw positionError;
        if (!positionData) throw new Error('Position not found');

        setPosition(positionData);

        // Fetch slots for the position
        const { data: slotsData, error: slotsError } = await supabase
          .from('slot_details')
          .select('*')
          .eq('position_id', positionId);

        if (slotsError) throw slotsError;
        setSlots(slotsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (positionId) {
      fetchData();
    }
  }, [positionId]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckInStatus('idle');
    setStatusMessage('');
    setLoading(true);

    try {
      // Find the slot where the user is registered
      const userSlot = slots.find(slot =>
        slot.volunteers.some(v => v.user.email.toLowerCase() === email.toLowerCase())
      );

      if (!userSlot) {
        throw new Error('You are not registered for any slots in this position');
      }

      // Check if already checked in
      const volunteer = userSlot.volunteers.find(v => 
        v.user.email.toLowerCase() === email.toLowerCase()
      );

      if (volunteer?.checked_in) {
        throw new Error('You have already checked in for this slot');
      }

      // Update check-in status
      const { error: updateError } = await supabase
        .from('position_volunteers')
        .update({ checked_in: true })
        .eq('slot_id', userSlot.id)
        .eq('user_id', volunteer?.user.id);

      if (updateError) throw updateError;

      setCheckInStatus('success');
      setStatusMessage('Successfully checked in!');
    } catch (err) {
      setCheckInStatus('error');
      setStatusMessage(err instanceof Error ? err.message : 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!position) return <ErrorMessage message="Position not found" />;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{position.name}</h2>
        
        {checkInStatus === 'idle' ? (
          <form onSubmit={handleCheckIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter your registered email"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              Check In
            </button>
          </form>
        ) : (
          <div className={`text-center ${checkInStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}