import type { Room } from '@/types';
import { DoorClosed, DoorOpen, Lock, Users } from 'lucide-react';

interface RoomListProps {
  rooms: Room[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function RoomList({ rooms, selectedId, onSelect }: RoomListProps) {
  return (
    <div className="space-y-2">
      {rooms.map((room) => {
        const selected = room.id === selectedId;
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onSelect(room.id)}
            className={[
              'w-full text-left rounded-xl border p-3 transition-all duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400',
              selected
                ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-300'
                : 'border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50/40',
              room.blocked ? 'opacity-75' : '',
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {room.blocked ? (
                  <Lock className="h-4 w-4 shrink-0 text-red-500" />
                ) : (
                  <DoorClosed className="h-4 w-4 shrink-0 text-sky-600" />
                )}
                <span className="truncate text-sm font-semibold text-gray-900">
                  {room.name}
                </span>
              </div>
              <span
                className={[
                  'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                  room.blocked
                    ? 'bg-red-100 text-red-700'
                    : 'bg-emerald-100 text-emerald-700',
                ].join(' ')}
              >
                {room.blocked ? 'Blocked' : 'Open'}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <DoorOpen className="h-3.5 w-3.5" />
                {room.building}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {room.capacity}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
