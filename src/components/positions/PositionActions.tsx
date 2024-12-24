import React from 'react';
import { QrCode, Pencil, Trash2, Plus } from 'lucide-react';
import type { PositionWithVolunteers } from '../../types/position';

interface PositionActionsProps {
  position: PositionWithVolunteers;
  isOwner: boolean;
  isExpanded: boolean;
  onExpand: (id: string) => void;
  onEdit: (position: PositionWithVolunteers) => void;
  onDelete: (id: string) => void;
  onGenerateQR: (id: string) => void;
  onCreateSlot: () => void;
}

export function PositionActions({
  position,
  isOwner,
  isExpanded,
  onExpand,
  onEdit,
  onDelete,
  onGenerateQR,
  onCreateSlot,
}: PositionActionsProps) {
  return (
    <div className="mt-4 flex space-x-2">
      <button
        onClick={() => onExpand(position.id)}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
      >
        {isExpanded ? 'Hide Slots' : 'View Slots'}
      </button>
      
      {isOwner && (
        <>
          <button
            onClick={onCreateSlot}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-green-700 bg-green-100 hover:bg-green-200"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Slot
          </button>
          <button
            onClick={() => onEdit(position)}
            className="text-gray-400 hover:text-indigo-600"
          >
            <Pencil className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(position.id)}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </>
      )}
      <button
        onClick={() => onGenerateQR(position.id)}
        className="text-gray-400 hover:text-indigo-600"
      >
        <QrCode className="h-5 w-5" />
      </button>
    </div>
  );
}