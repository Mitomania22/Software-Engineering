# AGENTS.md — Smart Campus Room Availability Checker

## Purpose
Web-based room availability checker. Read-only: never creates or modifies bookings.

## Architecture
- `src/App.tsx` — UI shell, form state, calls checkAvailability
- `src/utils/bookingLogic.ts` — pure deterministic rules (source of truth)
- `src/data/sampleData.ts` — fictional fixtures (5 rooms, sample bookings)
- `src/components/` — RoomList, Schedule, VerdictBanner
- `src/types.ts` — shared types

## Setup
npm install
npm run dev

## Safe commands
npm test            # Vitest, run before proposing acceptance
npm run lint        # ESLint
npx tsc --noEmit    # typecheck
npm run build       # production build

## Coding conventions
- Pure functions in bookingLogic.ts; no side effects
- Preserve AC1–AC6 (see below)
- At most 2 justified design patterns
- Never mutate fixtures

## Acceptance criteria (must stay true)
AC1 interval validity; AC2 duration cap (120 min); AC3 blocked room;
AC4 no overlap (touching allowed); AC5 fixtures unchanged; AC6 responsive UI.

## Test expectations
Run existing tests; add focused regression tests for any change.
Report changed files, rationale and test evidence.

## Forbidden actions
- Do NOT commit secrets, API keys, .env files
- Do NOT deploy or connect to production services
- Do NOT run destructive commands (rm -rf, git reset --hard, force push)
- Do NOT add/upgrade dependencies without human review
- Do NOT modify sampleData.ts fixtures
- Do NOT introduce real personal data

## Review gates
All agent-generated code requires human review + passing tests before merge.
On conflict, AGENTS.md governs over README.md.