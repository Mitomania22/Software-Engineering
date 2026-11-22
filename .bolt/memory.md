# Project memory

## Product intent & audience

- Educational/coursework project referenced as a "week 11 app"; likely a graded exercise that may expect Git workflow (branches/merges).
- A feature described as "explain-availability" was previously discussed; intent/status still unclear.

## Brand personality & voice

- Not yet inferred beyond global design preferences in `.bolt/prompt`.

## Visual design & UX direction

- Not yet inferred from project-specific context; await user design requests.

## Decisions, constraints & rationale

- Stack: Vite + React (JSX), Tailwind CSS, Lucide React icons; `@/` path alias maps to `src/`.
- No Git repository is connected; the project is a single working copy with no branches (no `main`, no `week 11` branch). Prior "week 11" code was moved into the project root and became the current working copy.
- Refactoring was completed; project is type-checked and all 28 tests pass.
- To enable real Git branches/merges, the project must be connected to GitHub via Bolt project settings → GitHub integration (UI action, not code).

## Open questions & assumptions

- Does the user need actual Git/GitHub integration, or just a saved "official" version point?
- What is the "explain-availability feature" and should it be restored/implemented next?
- No explicit design direction or branding has been requested yet.