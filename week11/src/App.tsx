import { useMemo, useState } from 'react';
import type { Room, Booking, Verdict } from '@/types';
import { sampleRooms, sampleBookings } from '@/data/sampleData';
import {
  checkAvailability,
  timeToMinutes,
  MAX_DURATION,
} from '@/utils/bookingLogic';
import RoomList from '@/components/RoomList';
import Schedule from '@/components/Schedule';
import VerdictBanner from '@/components/VerdictBanner';
import { Building2, Clock, ArrowRight, CheckCheck } from 'lucide-react';

function App() {
  const [rooms] = useState<Room[]>(sampleRooms);
  const [bookings] = useState<Booking[]>(sampleBookings);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(sampleRooms[0].id);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [currentTime, setCurrentTime] = useState('08:00');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId) ?? null,
    [rooms, selectedRoomId]
  );

  const roomBookings = useMemo(
    () => bookings.filter((b) => b.roomId === selectedRoomId),
    [bookings, selectedRoomId]
  );

  function handleCheck() {
    setFormError(null);
    const currentMinutes = timeToMinutes(currentTime);
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    if (currentMinutes === null) {
      setVerdict(null);
      setFormError('Please enter a valid current time in HH:MM (24-hour) format.');
      return;
    }
    if (start === null || end === null) {
      setVerdict(null);
      setFormError('Please enter valid times in HH:MM (24-hour) format.');
      return;
    }
    if (!selectedRoom) {
      setVerdict(null);
      setFormError('Please select a room.');
      return;
    }
    setVerdict(checkAvailability(start, end, currentMinutes, selectedRoom, bookings));
  }

  function handleReset() {
    setVerdict(null);
    setFormError(null);
  }

  const durationLabel = useMemo(() => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    if (start === null || end === null || end <= start) return null;
    return end - start;
  }, [startTime, endTime]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-100 text-gray-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight sm:text-xl">
                Smart Campus Room Availability Checker
              </h1>
              <p className="text-xs text-gray-500 sm:text-sm">
                Check if a campus room is free for your requested time slot.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left — room picker */}
          <section
            aria-label="Room selection"
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
              Select a Room
            </h2>
            <RoomList
              rooms={rooms}
              selectedId={selectedRoomId}
              onSelect={(id) => {
                setSelectedRoomId(id);
                handleReset();
              }}
            />
          </section>

          {/* Right — checker + schedule */}
          <section className="space-y-6">
            {/* Current time + form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-sky-600" />
                <label htmlFor="currentTime" className="font-medium">
                  Current time:
                </label>
                <input
                  id="currentTime"
                  type="time"
                  value={currentTime}
                  onChange={(e) => {
                    setCurrentTime(e.target.value);
                    handleReset();
                  }}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
                <span className="ml-auto text-xs text-gray-400">
                  Bookings are read-only — checking never alters them.
                </span>
              </div>

              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                Request a Time Slot
              </h2>

              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="startTime" className="mb-1 block text-sm font-medium text-gray-700">
                    Start time
                  </label>
                  <input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      handleReset();
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="mb-1 block text-sm font-medium text-gray-700">
                    End time
                  </label>
                  <input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      handleReset();
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>

              {durationLabel !== null && (
                <p className="mt-2 text-xs text-gray-500">
                  Duration: <span className="font-medium text-gray-700">{durationLabel} min</span>
                  {durationLabel > MAX_DURATION && (
                    <span className="ml-1 text-red-600">
                      (exceeds {MAX_DURATION}-min limit)
                    </span>
                  )}
                </p>
              )}

              {formError && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCheck}
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.98]"
                >
                  Check Availability
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Verdict */}
            <VerdictBanner verdict={verdict} />

            {/* Schedule for selected room */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-sky-600" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                  Today's Schedule — {selectedRoom?.name ?? '—'}
                </h2>
              </div>
              <Schedule bookings={roomBookings} />
              <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
                Day runs from 00:00 to 24:00 (1440 min). Touching slots (e.g.
                10:00–11:00 and 11:00–12:00) are allowed.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-8 text-center text-xs text-gray-400 sm:px-6">
        Fictional sample data · Max {MAX_DURATION} min per booking · Read-only checker
      </footer>
    </div>
  );
}

export default App;
