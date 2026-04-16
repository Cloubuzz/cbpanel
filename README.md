# CBPanel

Admin panel frontend built with React, TypeScript, Vite, and Redux Toolkit.

## Quick Start

1. Install dependencies: `npm install`
2. Create env file from example: `cp .env.example .env`
3. Start local dev server: `npm run dev`
4. Create production build: `npm run build`

## Environment Variables

- `VITE_API_BASE_PATH`: Base path used by frontend API calls.
  - Local default: `/adminapi`
  - Works with Vite proxy in development and Vercel rewrite in production.

## Architecture Baseline

- `lib/`: Shared low-level utilities such as HTTP client.
- `services/`: Domain API and persistence services.
- `store/slices/`: Redux slices for feature/application state.
- `store/selectors/`: Stable selectors for reusable state reads.
- `pages/` and `components/`: UI layer only (minimal data-access logic).

## Production Engineering Guardrails

- Keep API calls in `services/` only; no direct `fetch` inside UI components.
- Keep reducers focused on state transitions; side effects live in thunks/services.
- Reuse selectors instead of ad-hoc state reads across pages.
- Keep strict TypeScript enabled and avoid `any` in app code.
- Centralize storage keys, parsing, and cleanup in service modules.
- Handle loading, success, and error states for every async flow.
- Keep environment-dependent values configurable via `VITE_` variables.
- Validate every change with diagnostics and build before release.
