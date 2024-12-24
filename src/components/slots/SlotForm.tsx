import React, { useState } from 'react';
import { usePositionStore } from '../../store/positionStore';
import type { Slot } from '../../types/slot';

interface SlotFormProps {
  positionId: string;
  onSubmit: (data: Omit<Slot, 'id' | 'created_at' | 'volunteers_checked_in'>) => void;
  initialData?: Slot;
  buttonText: string;
}

export function SlotForm({ positionId, onSubmit, initialData, buttonText }: SlotFormProps) {
  const [error, setError] = useState<string | null>(null);
  const { positions } = usePositionStore();
  const position = positions.find(p => p.id === positionId);

  const [formData, setFormData] = useState({
    start_time: initialData?.start_time ? new Date(initialData.start_time).toISOString().slice(0, 16) : '',
    end_time: initialData?.end_time ? new Date(initialData.end_time).toISOString().slice(0, 16) : '',
    capacity: initialData?.capacity || 1,
  });

  if (!position) {
    return <div className="text-gray-500">Loading position details...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onSubmit({
        ...formData,
        position_id: positionId,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        capacity: Number(formData.capacity)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const positionStartTime = new Date(position.start_time).toISOString().slice(0, 16);
  const positionEndTime = new Date(position.end_time).toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div>
        <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
          Start Time
        </label>
        <input
          type="datetime-local"
          id="start_time"
          required
          value={formData.start_time}
          min={positionStartTime}
          max={positionEndTime}
          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
          End Time
        </label>
        <input
          type="datetime-local"
          id="end_time"
          required
          value={formData.end_time}
          min={formData.start_time || positionStartTime}
          max={positionEndTime}
          onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
          Capacity
        </label>
        <input
          type="number"
          id="capacity"
          required
          min="1"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: Math.max(1, parseInt(e.target.value) || 1) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {buttonText}
      </button>
    </form>
  );
}