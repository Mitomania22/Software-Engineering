# Project memory

## Product intent & audience

- Booking/scheduling application with time-slot selection and duration limits.
- Core domain: selecting a start time and a duration (max 120 minutes).

## Brand personality & voice

- Not yet inferred beyond global design instructions in `.bolt/prompt`.

## Visual design & UX direction

- App screen surfaces a visible duration limit to users.
- No specific aesthetic/typography/layout inferred yet from this turn.

## Decisions, constraints & rationale

- Max booking duration = 120 minutes, defined as a shared constant (`MAX_DURATION`) in the booking rules/logic module.
- Prefer importing shared constants over hardcoding duplicate values, so displayed limits and enforced rules never drift.
- `minutesToTime` exists as a time-formatting utility for converting minute values to display strings.
- Tech constraints (from `.bolt/prompt`): JSX + Tailwind, React hooks, Lucide React icons, `@/` path alias to `src/`; no extra UI/theme/icon packages unless explicitly requested.
- Linting enforced via `@typescript-eslint`; unused imports/vars are errors, not warnings.

## Open questions & assumptions

- Exact domain of bookings (appointments, meetings, resources?) is unconfirmed.
- Target audience and brand identity not yet established.
- Test runner assumed configured (28 tests present); framework not yet identified.
- Only minimal app surface has been seen; broader UX/visual system still to be inferred.