import type { Booking, Verdict } from '@/types';

export type ExplanationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; text: string }
  | { status: 'fallback'; text: string };

interface ExplainRequest {
  verdict: Verdict & { roomId?: string };
  roomName: string;
  startMinutes: number;
  endMinutes: number;
  bookings: Booking[];
}

function findConflict(bookings: Booking[], roomId: string, start: number, end: number) {
  const b = bookings.find((x) => x.roomId === roomId && start < x.end && end > x.start);
  return b ? { title: b.title, start: b.start, end: b.end } : null;
}

// Guard against a phrasing layer contradicting the deterministic verdict.
function contradictsVerdict(text: string, available: boolean): boolean {
  if (available) return /\bunavailable\b/i.test(text);
  return /\bavailable\b/i.test(text) && !/\bunavailable\b/i.test(text);
}

export async function fetchExplanation(
  req: ExplainRequest,
): Promise<ExplanationState> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/explain-availability`;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('your-project')) return { status: 'fallback', text: req.verdict.reason };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        available: req.verdict.available,
        reason: req.verdict.reason,
        roomName: req.roomName,
        startMinutes: req.startMinutes,
        endMinutes: req.endMinutes,
        conflict: findConflict(
          req.bookings,
          req.verdict.roomId ?? '',
          req.startMinutes,
          req.endMinutes,
        ),
      }),
    });

    if (!response.ok) return { status: 'fallback', text: req.verdict.reason };

    const data: unknown = await response.json();
    if (typeof data !== 'object' || data === null) {
      return { status: 'fallback', text: req.verdict.reason };
    }
    const body = data as Record<string, unknown>;
    if (typeof body.explanation !== 'string' || !body.explanation) {
      return { status: 'fallback', text: req.verdict.reason };
    }
    if (typeof body.available !== 'boolean' || body.available !== req.verdict.available) {
      return { status: 'fallback', text: req.verdict.reason };
    }
    if (contradictsVerdict(body.explanation, req.verdict.available)) {
      return { status: 'fallback', text: req.verdict.reason };
    }

    return { status: 'ready', text: body.explanation };
  } catch {
    return { status: 'fallback', text: req.verdict.reason };
  } finally {
    clearTimeout(timeout);
  }
}
