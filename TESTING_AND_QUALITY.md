# optum-drug-matcher — Testing & Quality Overview

> Generated for planner consumption. Summarizes automated tests, type safety, linting, E2E, and regression coverage as of project review.

## Codebase overview

Split **backend** (Express + Mongoose, **JavaScript**) and **frontend** (Next.js 16 + React 19, **TypeScript**):

| Area | Role |
|------|------|
| `backend/server.js` | API on port 5001 (default), `/health`, `/api/drugs/*`, `/api/diagnostics/*` |
| `backend/services/searchService.js` | Vector, full-text, hybrid search via MongoDB Atlas |
| `backend/scripts/seedDatabase.js` | Seeds ~1000 drugs + VoyageAI embeddings |
| `frontend/app/` + `components/` | Search UI (vector / fulltext / hybrid) |
| `frontend/lib/api.ts` | Typed API client |

**Not present:** root `package.json`, CI workflows (`.github/`), monorepo test runner.

---

## Automated tests

### Formal test suites: none

Searched for:

- `*.test.*` / `*.spec.*`
- `__tests__/`
- Jest, Vitest, Mocha, Supertest, Playwright, Cypress configs

**Result:** zero unit/integration test files; no test framework in either `package.json`.

### Backend smoke script (only scripted “test”)

**Script:** `backend/scripts/testVectorSearch.js`  
**npm script:** `npm run test:vector` (in `backend/package.json`)

**Flow:**

1. `GET /health`
2. `GET /api/drugs/stats/overview` (DB has data)
3. `GET /api/diagnostics/embeddings` (512-dim check; non-fatal if unavailable)
4. `GET /api/drugs/search/vector?query=Diabetes medication&limit=5`
5. Exit `0` if results exist, `1` otherwise

**Notes:**

- Not Jest/Vitest; no assertion library, no coverage, no CI
- Requires running server, seeded DB, Atlas indexes, `VOYAGEAI_API_KEY`
- Default API base: `http://localhost:5001` (`API_BASE_URL` env override)

### Diagnostic script (not a test suite)

**Script:** `backend/scripts/checkEmbeddings.js`  
**npm script:** `npm run check:embeddings`

Connects to MongoDB, samples drugs, prints embedding dimensions (expects 512). Ops/debugging, not regression testing.

---

## End-to-end (E2E) tests

**Status: none configured**

- No Playwright/Cypress config or `e2e/` folder
- `@playwright/test` appears only as optional Next.js peer in `frontend/package-lock.json` — not installed or scripted
- No `test:e2e` script

**Current E2E:** manual — start backend + frontend, use UI, or curl APIs (see docs below).

---

## Regression tests

**Status: none**

No snapshot/golden files, fixed query → expected-results fixtures, API contract tests, or search-quality baselines.

Docs (`START_HERE.md`, `IMPLEMENTATION_COMPLETE.md`) use manual checklists (e.g. “test all three search types”).

---

## Type safety

### Frontend (TypeScript)

- **Config:** `frontend/tsconfig.json` — `"strict": true`, `"noEmit": true`
- **Types:** `frontend/lib/api.ts` — `Drug`, `SearchResponse`, `DrugDetailResponse`, etc.
- **No** dedicated `typecheck` / `tsc` script in `package.json`
- Type checking effectively runs on **`next build`** (Next integrates TypeScript)

### Backend (JavaScript only)

- No TypeScript, no `@ts-check`, no runtime schema validation (e.g. Zod) on routes
- Types only in comments/JSDoc-style blocks in services

---

## Lint checks

### Frontend

- **Script:** `npm run lint` → `eslint`
- **Config:** `frontend/eslint.config.mjs`
  - `eslint-config-next/core-web-vitals`
  - `eslint-config-next/typescript`
- **Ignores:** `.next/`, `out/`, `build/`, `next-env.d.ts`

### Backend

- No ESLint/Prettier
- No `lint` script

### Docs vs automation

`FINAL_UPDATE_SUMMARY.md` / `DATABASE_UPDATE_SUMMARY.md` mention “linter checks pass” — reflects manual/editor runs, not enforced CI (no workflows, no pre-commit hooks found).

---

## Manual / doc-driven testing

| Source | What it covers |
|--------|----------------|
| `npm run test:vector` | Vector search smoke against live API |
| `FINAL_UPDATE_SUMMARY.md` | curl: health, vector, fulltext, hybrid |
| `INDEX_SETUP.md` | MongoDB shell aggregates for index verification |
| `QUICK_START.md` / `README.md` | Browser health check, seed + UI trial |
| `GET /api/diagnostics/embeddings` | Runtime embedding dimension check |

**Example manual API checks:**

```bash
curl http://localhost:5001/health
curl "http://localhost:5001/api/drugs/search/vector?query=diabetes&limit=5"
curl "http://localhost:5001/api/drugs/search/fulltext?query=blood+pressure&limit=5"
curl "http://localhost:5001/api/drugs/search/hybrid?query=heart+medication&limit=5"
```

---

## Summary matrix

| Category | Status |
|----------|--------|
| Unit tests | ❌ None |
| Integration tests (framework) | ❌ None |
| Smoke / script test | ✅ `backend`: `npm run test:vector` |
| E2E (Playwright/Cypress) | ❌ None |
| Regression suite | ❌ None |
| Frontend type safety | ✅ TS strict; mainly via `next build` |
| Backend type safety | ❌ Plain JS |
| Frontend lint | ✅ `npm run lint` |
| Backend lint | ❌ None |
| CI (GitHub Actions, etc.) | ❌ None |

---

## Suggested additions (not implemented)

For planner / implementation backlog:

1. **Backend:** Jest/Vitest + Supertest on `server.js` (mock Mongo/VoyageAI), or contract tests for `/api/drugs/search/*`
2. **Frontend:** Vitest + React Testing Library; `tsc --noEmit` in CI
3. **E2E:** Playwright on `localhost:3000` with Next rewrites to API
4. **Regression:** JSON fixtures (query → expected top-N drug IDs/scores) against test DB
5. **CI:** workflow running lint, typecheck, unit tests; optional `test:vector` against staging Atlas

---

## Key file paths

```
optum-drug-matcher/
├── backend/
│   ├── package.json          # scripts: test:vector, check:embeddings
│   ├── scripts/
│   │   ├── testVectorSearch.js
│   │   └── checkEmbeddings.js
│   └── server.js
├── frontend/
│   ├── package.json          # script: lint
│   ├── tsconfig.json
│   ├── eslint.config.mjs
│   └── lib/api.ts
└── (no .github/workflows)
```

---

## Unit tests (backend + frontend)

**Backend:** Jest + Supertest with mocks — `cd backend && npm test`  
**Frontend:** Vitest + React Testing Library — `cd frontend && npm test`

Backend unit tests live under `backend/__tests__/unit/` and `backend/__tests__/routes/`. No MongoDB, VoyageAI, or running server required.

---

## Integration tests (backend, Atlas-only)

**Script:** `RUN_INTEGRATION_TESTS=1 npm run test:integration` (in `backend/`)

Full-stack tests use [`backend/app.js`](backend/app.js) `createApp()` with Supertest in-process: routes → services → Mongoose → Atlas Search + VoyageAI. No mocks.

| Requirement | Purpose |
|-------------|---------|
| `RUN_INTEGRATION_TESTS=1` | Explicit opt-in gate |
| `MONGODB_URI` | Atlas connection |
| `VOYAGEAI_API_KEY` | Vector/hybrid search |
| Seeded DB + Atlas indexes | See `backend/__tests__/integration/README.md` |

Tests are skipped automatically when the gate env vars are unset. See [`backend/__tests__/integration/README.md`](backend/__tests__/integration/README.md) for prerequisites and troubleshooting.

**Distinction from smoke script:** `npm run test:vector` hits a running server via HTTP; integration tests mount the app in-process with Jest assertions covering vector, fulltext, hybrid, stats, diagnostics, and read routes.

**Combined:** `RUN_INTEGRATION_TESTS=1 npm run test:all` runs unit then integration.

