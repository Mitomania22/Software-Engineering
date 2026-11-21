/**
 * Mock LLM adapter.
 *
 * Stands in for a real LLM provider. It "generates" a short natural-language
 * explanation from the structured availability payload using deterministic
 * templates, so the deterministic checker stays the single source of truth.
 * Swapping this file for a real provider call is the only change needed later.
 */

export interface MockRoom {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
}

export interface MockBooking {
  id: string;
  roomId: string;
  start: number;
  end: number;
  title: string;
  bookedBy: string;
}

export interface ExplanationRequest {
  room: MockRoom;
  slot: { start: number; end: number; current: number };
  verdict: { available: boolean; reason: string };
  bookings: MockBooking[];
}

export interface ExplanationResult {
  explanation: string;
  model: 'mock-llm-v1';
}

const MINUTES_PER_DAY = 1440;
const MAX_EXPLANATION_LENGTH = 600;

export function validateExplanationRequest(body: unknown): ExplanationRequest {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Request body must be a JSON object.');
  }
  const { room, slot, verdict, bookings } = body as Record<string, unknown>;

  if (typeof room !== 'object' || room === null) throw new Error('room is required.');
  const r = room as Record<string, unknown>;
  if (typeof r.id !== 'string' || r.id.length === 0 || r.id.length > 64) {
    throw new Error('room.id must be a non-empty string.');
  }
  if (typeof r.name !== 'string' || r.name.length === 0 || r.name.length > 120) {
    throw new Error('room.name must be a non-empty string.');
  }
  if (typeof r.building !== 'string' || r.building.length > 120) {
    throw new Error('room.building must be a string.');
  }
  if (typeof r.capacity !== 'number' || !Number.isInteger(r.capacity) || r.capacity < 0) {
    throw new Error('room.capacity must be a non-negative integer.');
  }
  if (typeof r.blocked !== 'boolean') throw new Error('room.blocked must be a boolean.');

  if (typeof slot !== 'object' || slot === null) throw new Error('slot is required.');
  const s = slot as Record<string, unknown>;
  for (const key of ['start', 'end', 'current'] as const) {
    const v = s[key];
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > MINUTES_PER_DAY) {
      throw new Error(`slot.${key} must be an integer between 0 and ${MINUTES_PER_DAY}.`);
    }
  }

  if (typeof verdict !== 'object' || verdict === null) throw new Error('verdict is required.');
  const v = verdict as Record<string, unknown>;
  if (typeof v.available !== 'boolean') throw new Error('verdict.available must be a boolean.');
  if (typeof v.reason !== 'string' || v.reason.length === 0 || v.reason.length > 300) {
    throw new Error('verdict.reason must be a non-empty string.');
  }

  if (!Array.isArray(bookings)) throw new Error('bookings must be an array.');
  for (const b of bookings) {
    if (typeof b !== 'object' || b === null) throw new Error('Each booking must be an object.');
    const bk = b as Record<string, unknown>;
    if (typeof bk.id !== 'string' || typeof bk.roomId !== 'string') {
      throw new Error('Each booking needs string id and roomId.');
    }
    if (
      typeof bk.start !== 'number' || !Number.isInteger(bk.start) ||
      typeof bk.end !== 'number' || !Number.isInteger(bk.end) ||
      bk.start < 0 || bk.end > MINUTES_PER_DAY
    ) {
      throw new Error('Booking start/end must be integers within 0–1440.');
    }
  }

  return body as ExplanationRequest;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Small deterministic pick so wording varies between slots without an LLM. */
function pick<T>(items: readonly T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

function buildExplanation(req: ExplanationRequest): string {
  const { room, slot, verdict, bookings } = req;
  const duration = slot.end - slot.start;
  const seed = room.id.length * 31 + slot.start + slot.end;

  if (verdict.available) {
    const roomsLikeThis = pick(
      [
        `There are no bookings touching ${minutesToTime(slot.start)}–${minutesToTime(slot.end)}.`,
        `The schedule for ${room.name} is clear around your requested slot.`,
      ],
      seed
    );
    return (
      `${room.name} (${room.building}, seats ${room.capacity}) is free for your ` +
      `${duration}-minute slot from ${minutesToTime(slot.start)} to ${minutesToTime(slot.end)}. ` +
      `${roomsLikeThis} The room is not blocked, and the slot is within the 120-minute limit.`
    );
  }

  const conflicting = bookings.find(
    (b) => b.roomId === room.id && slot.start < b.end && slot.end > b.start
  );

  if (room.blocked) {
    return (
      `${room.name} cannot be booked right now because the room itself is blocked ` +
      `(for example for maintenance). No time slot will succeed until it is unblocked.`
    );
  }

  if (conflicting) {
    const gaps = bookings
      .filter((b) => b.roomId === room.id && b.end <= slot.start)
      .sort((a, b) => b.end - a.end);
    const suggestion =
      gaps.length > 0
        ? ` The room frees up again at ${minutesToTime(gaps[0].end)}.`
        : '';
    return (
      `${room.name} is taken in your slot because "${conflicting.title}" ` +
      `(${minutesToTime(conflicting.start)}–${minutesToTime(conflicting.end)}, booked by ${conflicting.bookedBy}) ` +
      `overlaps it. Touching slots are allowed, but actual overlap is not.${suggestion}`
    );
  }

  if (slot.start <= slot.current) {
    return (
      `The start time ${minutesToTime(slot.start)} is not in the future ` +
      `(current time is ${minutesToTime(slot.current)}). Pick a start after that.`
    );
  }

  if (duration > 120) {
    return (
      `Your slot runs ${duration} minutes, which is over the 120-minute maximum. ` +
      `Shortening it to 120 minutes or less would work.`
    );
  }

  return `The request was rejected: ${verdict.reason}`;
}

/**
 * Simulates an LLM call: derives a short explanation from the structured
 * payload. Validates its own output before returning.
 */
export async function generateExplanation(
  req: ExplanationRequest
): Promise<ExplanationResult> {
  const explanation = buildExplanation(req).trim();

  if (typeof explanation !== 'string' || explanation.length === 0) {
    throw new Error('Mock adapter produced an empty explanation.');
  }
  if (explanation.length > MAX_EXPLANATION_LENGTH) {
    throw new Error('Mock adapter produced an over-long explanation.');
  }

  return { explanation, model: 'mock-llm-v1' };
}
