# Project memory

## Product intent & audience

- App is a weekly course/assignment project stored in `week11/` subfolder.

## Brand personality & voice

- Not yet inferred.

## Visual design & UX direction

- Not yet inferred.

## Decisions, constraints & rationale

- Bolt preview runs from project root; no setting to change the dev-server folder.
- Chosen approach (option 2): keep app in `week11/` and add root `package.json` with `dev`, `build`, `preview`, `test` scripts that forward into `week11/`.
- Root `build` command verified to compile cleanly end-to-end.
- Fallback option identified: move app files to project root if preview still shows blank screen.

## Open questions & assumptions

- Whether Bolt preview correctly picks up the forwarded root scripts (may still show blank screen).
- If blank screen persists, decide whether to move app to root.