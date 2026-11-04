import type { Booking, Room, Verdict } from '@/types';

export const MINUTES_PER_DAY = 1440;
export const MAX_DURATION = 120;

/** Convert "HH:MM" to minutes from midnight, or null if invalid. */
export function timeToMinutes(time: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

/** Convert minutes from midnight to "HH:MM" (24-hour). */
export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Core availability check implementing AC1–AC4.
 * Returns a verdict without modifying any existing booking data (AC5).
 */
export function checkAvailability(
  start: number,
  end: number,
  currentMinutes: number,
  room: Room,
  bookings: Booking[]
): Verdict {
  // AC1 — interval validity
  if (start < 0 || end > MINUTES_PER_DAY || start >= end) {
    return {
      available: false,
      reason: 'Invalid time range. Start must be earlier than end, and both must fall within 00:00–24:00.',
    };
  }
  if (start <= currentMinutes) {
    return {
      available: false,
      reason: `Start time must be after the current time (${minutesToTime(currentMinutes)}).`,
    };
  }

  // AC2 — duration cap
  const duration = end - start;
  if (duration > MAX_DURATION) {
    return {
      available: false,
      reason: `Booking length is ${duration} min — the maximum allowed is ${MAX_DURATION} min.`,
    };
  }

  // AC3 — room blocked
  if (room.blocked) {
    return {
      available: false,
      reason: `${room.name} is currently blocked and cannot be booked.`,
    };
  };

  // AC4 — overlap (touching endpoints allowed)
  const overlapping = bookings.find(
    (b) => b.roomId === room.id && start < b.end && end > b.start
  );
  if (overlapping) {
    return {
      available: false,
      reason: `Overlaps with "${overlapping.title}" (${minutesToTime(overlapping.start)}–${minutesToTime(overlapping.end)}).`,
    };
  }

  return {
    available: true,
    reason: `${room.name} is available from ${minutesToTime(start)} to ${minutesToTime(end)} (${duration} min).`,
  };
}
