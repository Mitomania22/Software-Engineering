import { describe, it, expect } from 'vitest';
import { checkAvailability, MAX_DURATION, MINUTES_PER_DAY } from '@/utils/bookingLogic';
import type { Booking, Room } from '@/types';
import { sampleBookings, sampleRooms } from '@/data/sampleData';

const NOW = 540; // 09:00
const BOOKING_600_660: Booking = { id: 'f1', roomId: 'r1', start: 600, end: 660, title: 'Fixture', bookedBy: 'T' };

function makeRoom(over: Partial<Room> = {}): Room {
  return { id: 'r1', name: 'Test Room', building: 'B', capacity: 10, blocked: false, ...over };
}

function makeBookings(over: Booking[] = [BOOKING_600_660]): Booking[] {
  return over.map((b) => ({ ...b }));
}

describe('checkAvailability', () => {
  // ─────────────────────────────────────────────
  // AC1 — Interval validity
  // ─────────────────────────────────────────────
  describe('Interval validity (AC1)', () => {
    it('T02 — 540–570 (start equals now) → unavailable', () => {
      const v = checkAvailability(540, 570, NOW, makeRoom(), makeBookings());
      expect(v.available).toBe(false);
      expect(v.reason).toContain('after the current time');
    });

    it('T03 — 720–720 (zero length) → unavailable', () => {
      const v = checkAvailability(720, 720, NOW, makeRoom(), makeBookings());
      expect(v.available).toBe(false);
      expect(v.reason).toContain('Invalid time range');
    });

    it('T04 — 750–720 (reversed) → unavailable', () => {
      const v = checkAvailability(750, 720, NOW, makeRoom(), makeBookings());
      expect(v.available).toBe(false);
      expect(v.reason).toContain('Invalid time range');
    });

    it('T05 — 1380–1441 (past end of day) → unavailable', () => {
      const v = checkAvailability(1380, MINUTES_PER_DAY + 1, NOW, makeRoom(), makeBookings());
      expect(v.available).toBe(false);
      expect(v.reason).toContain('Invalid time range');
    });

    it('T16 — 500–550 (before now) → unavailable', () => {
      const v = checkAvailability(500, 550, NOW, makeRoom(), makeBookings());
      expect(v.available).toBe(false);
      expect(v.reason).toContain('after the current time');
    });

    it('T15 — 540–600 (start equals now) → unavailable', () => {
      const v = checkAvailability(540, 600, NOW, makeRoom(), makeBookings());
      expect(v.available).toBe(false);
      expect(v.reason).toContain('after the current time');
    });

    // Additional boundary: start < 0 (before midnight)
    it('T17 — -1 to 60 (start before midnight) → unavailable', () => {
      const v = checkAvailability(-1, 60, NOW, makeRoom(), makeBookings());
      expect(v.available).toBe(false);
      expect(v.reason).toContain('Invalid time range');
    });

    // Additional boundary: end = 1440 (exactly midnight) should be valid
    it('T18 — 1320–1440 (end exactly at midnight) → available', () => {
      const v = checkAvailability(1320, MINUTES_PER_DAY, NOW, makeRoom(), makeBookings());
      expect(v.available).toBe(true);
      expect(v.reason).toContain('available from');
    });
  });

  // ─────────────────────────────────────────────
  // AC2 — Duration cap
  // ─────────────────────────────────────────────
  describe('Duration cap (AC2)', () => {
    it('T06 — 720–840 (exactly 120) → available', () => {
      const v = checkAvailability(720, 840, NOW, makeRoom(), makeBookings());
      expect(v.available).toBe(true);
      expect(v.reason).toContain('(120 min)');
    });

    it('T07 — 720–841 (121 min) → unavailable', () => {
      const v = checkAvailability(720, 841, NOW, makeRoom(), makeBookings());
      expect(v.available).toBe(false);
      expect(v.reason).toContain('maximum allowed');
    });

    // Additional boundary: 119 min (just under cap)
    it('T19 — 721–840 (119 min, just under cap) → available', () => {
      const v = checkAvailability(721, 840, NOW, makeRoom(), makeBookings());
      expect(v.available).toBe(true);
      expect(v.reason).toContain('(119 min)');
    });
  });

  // ─────────────────────────────────────────────
  // AC3 — Blocked room
  // ─────────────────────────────────────────────
  describe('Blocked room (AC3)', () => {
    it('T13 — 660–720, room.blocked = true → unavailable', () => {
      const v = checkAvailability(660, 720, NOW, makeRoom({ blocked: true }), makeBookings());
      expect(v.available).toBe(false);
      expect(v.reason).toContain('blocked');
    });
  });

  // ─────────────────────────────────────────────
  // AC4 — Overlap (touching endpoints allowed)
  // ─────────────────────────────────────────────
  describe('Overlap (AC4)', () => {
    it('T01 — 660–720 (touching after) → available', () => {
      const v = checkAvailability(660, 720, NOW, makeRoom(), makeBookings());
      expect(v.available).toBe(true);
      expect(v.reason).toContain('available from');
    });

    it('T08 — 570–600 (touching before) → available', () => {
      const v = checkAvailability(570, 600, NOW, makeRoom(), makeBookings());
      expect(v.available).toBe(true);
      expect(v.reason).toContain('available from');
    });

    it('T09 — 630–690 (partial overlap) → unavailable', () => {
      const v = checkAvailability(630, 690, NOW, makeRoom(), makeBookings());
      expect(v.available).toBe(false);
      expect(v.reason).toContain('Overlaps with');
    });

    it('T10 — 570–690 (contains booking) → unavailable', () => {
      const v = checkAvailability(570, 690, NOW, makeRoom(), makeBookings());
      expect(v.available).toBe(false);
      expect(v.reason).toContain('Overlaps with');
    });

    it('T11 — 615–645 (inside booking) → unavailable', () => {
      const v = checkAvailability(615, 645, NOW, makeRoom(), makeBookings());
      expect(v.available).toBe(false);
      expect(v.reason).toContain('Overlaps with');
    });

    it('T12 — 600–660 (identical interval) → unavailable', () => {
      const v = checkAvailability(600, 660, NOW, makeRoom(), makeBookings());
      expect(v.available).toBe(false);
      expect(v.reason).toContain('Overlaps with');
    });

    it('T14 — 630–690, bookings = [] → available', () => {
      const v = checkAvailability(630, 690, NOW, makeRoom(), makeBookings([]));
      expect(v.available).toBe(true);
      expect(v.reason).toContain('available from');
    });
  });

  // ─────────────────────────────────────────────
  // AC5 — Data preservation
  // ─────────────────────────────────────────────
  describe('Data preservation (AC5)', () => {
    it('P1 — bookings array and objects unchanged after the call', () => {
      const bookings = makeBookings();
      const snapshot = JSON.stringify(bookings);
      const ref = bookings;
      checkAvailability(570, 600, NOW, makeRoom(), bookings);
      expect(JSON.stringify(bookings)).toBe(snapshot);
      expect(bookings).toBe(ref); // same array reference, not replaced
    });
  });

  // ─────────────────────────────────────────────
  // Regression — sample campus data
  // ─────────────────────────────────────────────
  describe('Regression on sample data', () => {
    const [allen, babbage, curie, darwin] = sampleRooms;

    it('R1 — 420–480 with current time 480 (past start, AC1) → unavailable', () => {
      const v = checkAvailability(420, 480, 480, allen, sampleBookings);
      expect(v.available).toBe(false);
      expect(v.reason).toContain('after the current time');
    });

    it('R2 — 720–600 reversed on sample room (AC1) → unavailable', () => {
      const v = checkAvailability(720, 600, 480, allen, sampleBookings);
      expect(v.available).toBe(false);
      expect(v.reason).toContain('Invalid time range');
    });

    it('R3 — 1319–1440 (121 min, ends at midnight, AC2) → unavailable', () => {
      const v = checkAvailability(1319, MINUTES_PER_DAY, 480, darwin, sampleBookings);
      expect(v.available).toBe(false);
      expect(v.reason).toContain('121 min');
      expect(v.reason).toContain('maximum allowed');
    });

    it('R4 — 1000–1060 in blocked Babbage Lab (AC3) → unavailable', () => {
      const v = checkAvailability(1000, 1060, 480, babbage, sampleBookings);
      expect(v.available).toBe(false);
      expect(v.reason).toContain('Babbage Lab 220 is currently blocked');
    });

    it('R5 — 660–690 in Curie Auditorium overlaps Guest Lecture (AC4) → unavailable', () => {
      const v = checkAvailability(660, 690, 480, curie, sampleBookings);
      expect(v.available).toBe(false);
      expect(v.reason).toContain('Guest Lecture: AI Ethics');
    });

    it('R6 — 660–690 in Allen Hall 101 is free, bookings are room-scoped (AC4) → available', () => {
      const v = checkAvailability(660, 690, 480, allen, sampleBookings);
      expect(v.available).toBe(true);
    });

    it('R7 — 660–780 touches both neighbours in Allen Hall 101 (AC4, exact 120 min AC2) → available', () => {
      const v = checkAvailability(660, 780, 480, allen, sampleBookings);
      expect(v.available).toBe(true);
      expect(v.reason).toContain('(120 min)');
    });

    it('R8 — checks across every sample room leave sample fixtures unchanged (AC5)', () => {
      const snapshot = JSON.stringify(sampleBookings);
      const frozen = sampleBookings.map((b) => Object.freeze({ ...b }));
      Object.freeze(frozen);
      for (const room of sampleRooms) {
        for (const [s, e] of [[540, 600], [600, 660], [660, 720], [1319, 1440]]) {
          expect(() => checkAvailability(s, e, 480, room, frozen)).not.toThrow();
        }
      }
      expect(JSON.stringify(sampleBookings)).toBe(snapshot);
    });
  });
});
