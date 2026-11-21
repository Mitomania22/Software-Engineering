// Mock AI explanation adapter. Runs server-side so a real LLM provider key
// could replace the template logic below without any browser change and
// without ever exposing a secret to the client.
//
// The adapter is phrasing-only: it receives the deterministic checker's
// verdict and slot data, and produces display text. It never decides
// availability.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ExplainBody {
  available: boolean;
  reason: string;
  roomName: string;
  startMinutes: number;
  endMinutes: number;
  conflict: { title: string; start: number; end: number } | null;
}

function fmt(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  // Strip control characters; output is rendered as plain display text.
  return value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, maxLen);
}

function validMinutes(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1440;
}

function validateBody(raw: unknown): ExplainBody | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const b = raw as Record<string, unknown>;
  if (typeof b.available !== 'boolean') return null;
  const reason = sanitizeText(b.reason, 300);
  const roomName = sanitizeText(b.roomName, 80);
  if (!reason || !roomName) return null;
  if (!validMinutes(b.startMinutes) || !validMinutes(b.endMinutes)) return null;

  let conflict: ExplainBody['conflict'] = null;
  if (typeof b.conflict === 'object' && b.conflict !== null) {
    const c = b.conflict as Record<string, unknown>;
    const title = sanitizeText(c.title, 120);
    if (title && validMinutes(c.start) && validMinutes(c.end)) {
      conflict = { title, start: c.start, end: c.end };
    }
  }

  return {
    available: b.available,
    reason,
    roomName,
    startMinutes: b.startMinutes,
    endMinutes: b.endMinutes,
    conflict,
  };
}

// Map the checker's fixed reason phrases to a display template. This is a
// display concern only; the verdict itself is never re-derived here.
function pickRuleKey(reason: string): string {
  if (/Invalid time range/i.test(reason)) return 'invalid';
  if (/after the current time/i.test(reason)) return 'past';
  if (/maximum allowed/i.test(reason)) return 'too-long';
  if (/currently blocked/i.test(reason)) return 'blocked';
  if (/Overlaps with/i.test(reason)) return 'overlap';
  return 'other';
}

function buildExplanation(b: ExplainBody): string {
  const { available, reason, roomName, startMinutes: s, endMinutes: e } = b;
  const duration = e - s;

  if (available) {
    return `Good news — ${roomName} is free from ${fmt(s)} to ${fmt(e)} (${duration} min). Nothing on today's schedule collides with your slot, so you can plan around it.`;
  }

  switch (pickRuleKey(reason)) {
    case 'invalid':
      return `That slot didn't work: ${reason} Double-check the times and try again.`;
    case 'past':
      return `That slot is already in the past. ${reason} Pick a start time later than the current time shown.`;
    case 'too-long':
      return `${roomName} bookings are capped at 120 minutes, and ${fmt(s)}–${fmt(e)} is ${duration} min. Try splitting it into two shorter slots.`;
    case 'blocked':
      return `${roomName} is blocked for the whole day, so no slot can be booked. Check the room list for an open alternative.`;
    case 'overlap': {
      const c = b.conflict;
      if (c) {
        return `${roomName} is already booked ${fmt(c.start)}–${fmt(c.end)} for "${c.title}". Your ${fmt(s)}–${fmt(e)} slot overlaps it — try starting at ${fmt(c.end)} or finishing by ${fmt(c.start)}.`;
      }
      return `${roomName} already has a booking that overlaps ${fmt(s)}–${fmt(e)}. Try a time just before or after it.`;
    }
    default:
      return reason;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = validateBody(await req.json());
    if (!body) {
      return new Response(JSON.stringify({ error: 'Invalid request payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const explanation = buildExplanation(body);

    return new Response(
      JSON.stringify({
        explanation,
        available: body.available,
        mock: true,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? 'Unexpected server error' : 'Unexpected server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
