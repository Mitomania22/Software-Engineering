import type { Room, Booking } from '@/types';

export const sampleRooms: Room[] = [
  { id: 'r1', name: 'Allen Hall 101',     building: 'Allen Hall',      capacity: 40, blocked: false },
  { id: 'r2', name: 'Babbage Lab 220',     building: 'Babbage Lab',     capacity: 25, blocked: true  },
  { id: 'r3', name: 'Curie Auditorium',    building: 'Curie Wing',      capacity: 120, blocked: false },
  { id: 'r4', name: 'Darwin Seminar 305',  building: 'Darwin Block',    capacity: 18, blocked: false },
  { id: 'r5', name: 'Einstein Study Lounge', building: 'Einstein Hall', capacity: 8,  blocked: false },
];

// All times are in minutes from 00:00. These represent "today's" schedule.
export const sampleBookings: Booking[] = [
  { id: 'b1', roomId: 'r1', start: 600,  end: 660,  title: 'Intro to Algorithms',  bookedBy: 'Prof. Lin'   },
  { id: 'b2', roomId: 'r1', start: 780,  end: 840,  title: 'Faculty Meeting',       bookedBy: 'Dept. Office'},
  { id: 'b3', roomId: 'r3', start: 600,  end: 720,  title: 'Guest Lecture: AI Ethics', bookedBy: 'Prof. Okafor' },
  { id: 'b4', roomId: 'r3', start: 900,  end: 960,  title: 'Film Screening',        bookedBy: 'Film Club'   },
  { id: 'b5', roomId: 'r4', start: 480,  end: 540,  title: 'Morning Tutorial',      bookedBy: 'TA Patel'    },
  { id: 'b6', roomId: 'r4', start: 840,  end: 900,  title: 'Research Group Sync',   bookedBy: 'Dr. Reyes'   },
  { id: 'b7', roomId: 'r5', start: 660,  end: 720,  title: 'Quiet Study Session',   bookedBy: 'Student Council' },
];
