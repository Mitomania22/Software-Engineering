import type { Booking, Room, Verdict } from '@/types';

export type ExplanationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; explanation: string; model: string }
  | { status: 'error'; message: string };

const MAX_BOOKINGS_SENT = 50;

function fetchExplanation(
  apiUrl: string,
  anonKey: string,
  payload: Record<string, unknown>,
  signal: AbortSignal
): Promise<string> {
  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  }).then(async (response) => {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      // fall through to status handling
    }
    if (!response.ok) {
      const message =
        typeof body === 'object' && body !== null && 'error' in body
          ? String((body as { error: unknown }).error)
          : `Request failed with status ${response.status}.`;
      throw new Error(message);
    }
    if (
      typeof body !== 'object' ||
      body === null ||
      typeof (body as { explanation?: unknown }).explanation !== 'string' ||
      (body as { explanation: string }).explanation.length === 0
    ) {
      throw new Error('The explanation service returned an unexpected response.');
    }
    return (body as { explanation: string }).explanation;
  });
}

export function createExplainer(baseUrl: string, anonKey: string) {
  const apiUrl = `${baseUrl}/functions/v1/explain-availability`;

  return async function explainAvailability(
    room: Room,
    slot: { start: number; end: number; current: number },
    verdict: Verdict,
    bookings: Booking[],
    signal: AbortSignal
  ): Promise<string> {
    const payload = {
      room: {
        id: room.id,
        name: room.name,
        building: room.building,
        capacity: room.capacity,
        blocked: room.blocked,
      },
      slot,
      verdict,
      bookings: bookings
        .filter((b) => b.roomId === room.id)
        .slice(0, MAX_BOOKINGS_SENT)
        .map((b) => ({
          id: b.id,
          roomId: b.roomId,
          start: b.start,
          end: b.end,
          title: b.title,
          bookedBy: b.bookedBy,
        })),
    };

    return fetchExplanation(apiUrl, anonKey, payload, signal);
  };
}
