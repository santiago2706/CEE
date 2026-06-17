# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # install all workspace deps
pnpm dev              # run all apps in parallel via Turborepo
pnpm build            # build all packages and apps
pnpm lint             # lint all workspaces

# Target a single app
pnpm --filter web dev
pnpm --filter admin dev
```

## Hard rules

- **pnpm only** — never `npm` or `yarn`.
- All domain types live in `packages/types` (`@cee/types`). Never redefine a domain type locally; always import from `@cee/types`.
- Never edit `components/ui/` by hand — that folder is owned by shadcn/ui.
- `localStorage` access is allowed only inside `apps/web/src/store/authStore.ts` (uses key `cee_token`).
- The `@/` alias maps to `apps/web/src/` and must always resolve correctly.

## Architecture

### Monorepo layout

```
apps/
  web/     # public site (React + Vite + TS + shadcn/ui + Tailwind)
  admin/   # backoffice panel (same stack)
packages/
  types/   # @cee/types — shared TypeScript contracts, single source of truth
  config/  # shared tsconfig base
  ui/      # shared component library (currently empty)
```

Turborepo wires the build graph: `build` depends on `^build` so `packages/types` always compiles before the apps.

### `apps/web` layers

| Layer | Path | Purpose |
|---|---|---|
| Types | `@cee/types` | Backend contract — camelCase, explicit types |
| Constants | `src/constants/` | `routes.ts` (ROUTES), `api.constants.ts` (API_BASE_URL, API_ENDPOINTS) |
| HTTP client | `src/services/api.ts` | Axios instance with auth + 401-redirect interceptors |
| Services | `src/services/*.service.ts` | One file per domain; call `api` from `services/api.ts` |
| Stores | `src/store/` | Zustand: `authStore` (auth + token), `cartStore` |
| Hooks | `src/hooks/` | React hooks that wrap services (e.g. `useCourses`) |
| Router | `src/router/index.tsx` | `createBrowserRouter`; all routes lazy-loaded with `Suspense` |
| Pages | `src/pages/<domain>/` | One folder per route; no logic — delegate to hooks/stores |
| Layout | `src/components/layout/` | `Layout`, `Navbar`, `MobileMenu`, `Footer` |

Admin routes (`/admin/*`) are wrapped in `ProtectedRoute` with `requiredRole="admin"`.

### Environment variables (`apps/web`)

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL for Axios (`http://localhost:3000/api` default) |
| `VITE_USE_MOCKS` | `"true"` → services return mock data; `"false"` → hit the real API |

The mock layer (Phase 1) lives under `src/mocks/` and is toggled at runtime by `VITE_USE_MOCKS`. When adding the mock branch to a service, keep the function signature identical to the real branch so flipping the flag is the only change needed to switch to the real API.

### Current vs. planned types

`packages/types/src/index.ts` has an earlier, minimal schema (snake-cased enum values, fewer fields). The Phase 1 spec (`fase1_cee.md`) defines the richer target schema (Spanish display strings for enums, additional fields like `syllabus`, `instructors`, `benefits`, `SalesReport`, etc.). When reconciling, annotate divergences with `// TODO(backend): confirmar contrato`.

### Data flow (services → UI)

Services call the Axios instance in `services/api.ts`. Hooks (`src/hooks/`) call services and expose loading/data state. Pages consume hooks. Stores (`authStore`, `cartStore`) are used directly in components when cross-cutting state is needed.