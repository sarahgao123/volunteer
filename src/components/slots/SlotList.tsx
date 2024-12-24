import React, { useState } from 'react';
import { Clock, Users, Pencil, Trash2 } from 'lucide-react';
import { SlotForm } from './SlotForm';
import { useSlotStore } from '../../store/slotStore';
import type { SlotWithVolunteers } from '../../types/slot';

interface SlotListProps {
  positionId: string;
  slots: SlotWithVolunteers[];
  isOwner: boolean;
}

export function SlotList({ positionId, slots, isOwner }: SlotListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingSlot, setEditingSlot] = useState<SlotWithVolunteers | null>(null);
  const { createSlot, updateSlot, deleteSlot, signUpForSlot } = useSlotStore();

  const handleCreate = async (data: any) => {
    await createSlot(data);
    setIsCreating(false);
  };

  const handleUpdate = async (data: any) => {
    if (editingSlot) {
      await updateSlot(editingSlot.id, data);
      setEditingSlot(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this slot?')) {
      await deleteSlot(id);
    }
  };

  return (
    <div className="space-y-4">
      {isOwner && (
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
        >
          Add Slot
        </button>
      )}

      {(isCreating || editingSlot) && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {isCreating ? 'Create New Slot' : 'Edit Slot'}
          </h4>
          <SlotForm
            positionId={positionId}
            onSubmit={isCreating ? handleCreate : handleUpdate}
            initialData={editingSlot}
            buttonText={isCreating ? 'Create Slot' : 'Update Slot'}
          />
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {slots.map((slot) => (
          <div key={slot.id} className="py-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      {new Date(slot.start_time).toLocaleString()} - 
                      {new Date(slot.end_time).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>
                      {slot.volunteers.length} / {slot.capacity} volunteers
                    </span>
                  </div>
                </div>
                {slot.volunteers.length > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    Volunteers: {slot.volunteers.map(v => v.user.email).join(', ')}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                {isOwner ? (
                  <>
                    <button
                      onClick={() => setEditingSlot(slot)}
                      className="text-gray-400 hover:text-indigo-600"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => signUpForSlot(slot.id)}
                    disabled={slot.volunteers.length >= slot.capacity}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sign Up
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}