import React, { useState } from 'react';
import { Clock, Users, QrCode, Pencil, Trash2, Plus } from 'lucide-react';
import type { PositionWithVolunteers } from '../../types/position';
import { SlotList } from '../slots/SlotList';
import { SlotForm } from '../slots/SlotForm';
import { useSlotStore } from '../../store/slotStore';
import { useQRCode } from '../../hooks/useQRCode';

interface PositionListProps {
  positions: PositionWithVolunteers[];
  onEdit: (position: PositionWithVolunteers) => void;
  onDelete: (id: string) => void;
  isEventOwner: boolean;
}

export function PositionList({ positions, onEdit, onDelete, isEventOwner }: PositionListProps) {
  const { slots, fetchSlots, createSlot } = useSlotStore();
  const { selectedQR, generateQRCode, closeQRCode } = useQRCode();
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);
  const [creatingSlotForPosition, setCreatingSlotForPosition] = useState<string | null>(null);

  const handleExpand = async (positionId: string) => {
    if (expandedPosition === positionId) {
      setExpandedPosition(null);
    } else {
      setExpandedPosition(positionId);
      await fetchSlots(positionId);
    }
  };

  const handleCreateSlot = async (data: any) => {
    try {
      await createSlot(data);
      setCreatingSlotForPosition(null);
    } catch (error) {
      console.error('Error creating slot:', error);
    }
  };

  return (
    <div className="space-y-6">
      {positions.map((position) => (
        <div key={position.id} className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <h3 className="text-lg font-medium text-gray-900">{position.name}</h3>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>
                      {new Date(position.start_time).toLocaleString()} - 
                      {new Date(position.end_time).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{position.volunteers_needed} volunteers needed</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {isEventOwner && (
                  <>
                    <button
                      onClick={() => onEdit(position)}
                      className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-gray-100"
                      title="Edit position"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(position.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-gray-100"
                      title="Delete position"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => generateQRCode(position.id)}
                  className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-gray-100"
                  title="Generate QR code"
                >
                  <QrCode className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => handleExpand(position.id)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
              >
                {expandedPosition === position.id ? 'Hide Slots' : 'View Slots'}
              </button>
              
              {isEventOwner && (
                <button
                  onClick={() => setCreatingSlotForPosition(position.id)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Slot
                </button>
              )}
            </div>
          </div>

          {expandedPosition === position.id && (
            <div className="border-t border-gray-200 p-6">
              {creatingSlotForPosition === position.id && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Create New Slot</h4>
                  <SlotForm
                    positionId={position.id}
                    onSubmit={handleCreateSlot}
                    buttonText="Create Slot"
                  />
                </div>
              )}
              <SlotList
                positionId={position.id}
                slots={slots}
                isOwner={isEventOwner}
              />
            </div>
          )}
        </div>
      ))}

      {selectedQR && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <img src={selectedQR} alt="QR Code" className="w-full mb-4" />
            <button
              onClick={closeQRCode}
              className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}