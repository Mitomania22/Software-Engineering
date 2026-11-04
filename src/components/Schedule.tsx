import { minutesToTime } from '@/utils/bookingLogic';
import type { Booking } from '@/types';
import { Clock } from 'lucide-react';

interface ScheduleProps {
  bookings: Booking[];
}

export default function Schedule({ bookings }: ScheduleProps) {
  if (bookings.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        No existing bookings for this room today.
      </p>
    );
  }

  const sorted = [...bookings].sort((a, b) => a.start - b.start);

  return (
    <ul className="space-y-1.5">
      {sorted.map((b) => (
        <li
          key={b.id}
          className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm"
        >
          <Clock className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="font-medium text-gray-700">
            {minutesToTime(b.start)}–{minutesToTime(b.end)}
          </span>
          <span className="text-gray-500 truncate">{b.title}</span>
        </li>
      ))}
    </ul>
  );
}
