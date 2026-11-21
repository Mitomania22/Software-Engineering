# Project memory

## Product intent & audience

- App is a weekly course/assignment project; now lives at project root (previously in `week11/` subfolder).

## Brand personality & voice

- Not yet inferred.

## Visual design & UX direction

- Not yet inferred.

## Decisions, constraints & rationale

- Bolt preview runs from project root; no setting to change the dev-server folder.
- Previous approach (option 2: forwarding root scripts into `week11/`) was abandoned in favor of option 1 (move app to root).
- All app files, config, and `package.json` moved from `week11/` to project root; `week11/` folder removed.
- Root `package.json` is now the real app manifest (replaced the forwarding one).
- Dependencies reinstalled at root; all 28 tests pass; production build compiles cleanly.

## Open questions & assumptions

- Whether Bolt preview now loads correctly (expected to work since app is at root).
- Old `week11/` folder contained a small Bolt prompt/config file removed with the folder; can be restored from Version History if project instructions look off.