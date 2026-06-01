# Unit test gaps (beyond original plan)

This document lists important unit-test coverage gaps identified after implementing the original unit test plan and reviewing assertions against production code. These items were **not** in the original plan but should be addressed to strengthen the suite.

**Current unit suites:**

| Package | Runner | Location |
|---------|--------|----------|
| Backend | Jest + Supertest | `backend/__tests__/unit/`, `backend/__tests__/routes/` |
| Frontend | Vitest + RTL | `frontend/__tests__/` |

Integration tests (`backend/__tests__/integration/`) are separate and are not covered here.

---

## Structural limitation (by design)

Unit tests mock at layer boundaries:

```text
Route tests  → mock searchService + Drug
Service tests → mock Drug + embeddingService
Page tests   → mock @/lib/api
```

No single unit test runs **routes → real services → real models**. That gap is intentionally covered by integration tests, but it means wiring mistakes (wrong args, wrong exports) can slip through unit tests alone.

---

## Backend

### `services/embeddingService.js`

| Gap | Why it matters | Priority |
|-----|----------------|----------|
| `generateEmbeddingsBatchChunked` untested | Used by seeding; chunking and 500ms delay logic have zero coverage | Medium |
| No assertion on `Authorization` header | API key wiring is part of the VoyageAI contract | Low |
| `generateEmbeddingsBatch` axios rejection | Only happy path and malformed response are tested | Low |
| `prepareDrugTextForEmbedding` with empty/missing `keywords` | Would throw at `drug.keywords.join` in production | Medium |

**File:** `backend/__tests__/unit/embeddingService.test.js`

---

### `services/searchService.js`

| Gap | Why it matters | Priority |
|-----|----------------|----------|
| Error paths only tested for `vectorSearch` | `fullTextSearch`, `hybridSearch`, `getAlternatives`, `getByTherapeuticClass`, `getByFormularyTier`, `getStatistics` all rethrow in `catch` blocks — untested | Medium |
| `fullTextSearch` pipeline details | Fuzzy config, search paths, `$limit` stage not asserted; pipeline could regress silently | Medium |
| `getByTherapeuticClass` / `getByFormularyTier` | Mocks do not assert `limit` or `sort({ average_cost: 1 })` arguments | Low |
| `generateEmbedding` failure in vector/hybrid | Common real-world failure when VoyageAI is down or rate-limited | Medium |
| `getAlternatives` when `findById` throws | Error propagation untested | Low |

**File:** `backend/__tests__/unit/searchService.test.js`

---

### `routes/drugs.js`

| Gap | Why it matters | Priority |
|-----|----------------|----------|
| Happy paths do not verify `searchService.*(query, limit)` | Handler could ignore `limit` or fail to forward `query` | Medium |
| `?query=` (empty string) → 400 | `!query` is truthy for `""`; easy regression | Low |
| `limit` query param passthrough | Routes use `parseInt(limit)`; not asserted end-to-end in route tests | Low |
| 500 handlers for get-by-id, alternatives, class, tier, stats | Only search routes have 500 tests | Medium |
| Invalid ObjectId for `GET /:id` | Mongoose may throw → 500 vs 404; behavior undocumented by tests | Low |
| **Tier `NaN` bypasses validation** | `parseInt('abc')` → `NaN`; `NaN < 1` and `NaN > 5` are both false, so invalid tier strings pass validation — **production bug** | **High** |
| Route ordering | `/stats/overview` vs `/:id` works today (multi-segment paths) but is implicit, not tested | Low |

**File:** `backend/__tests__/routes/drugs.test.js`

---

### `routes/diagnostics.js`

| Gap | Why it matters | Priority |
|-----|----------------|----------|
| Drug with missing `description_embedding` | Handler uses `?.length \|\| 0`; should report 0 dimensions and `dimensionsMatch: false` | Medium |
| `countDocuments` throws → 500 | Untested error path | Low |
| Partial happy-path body | `totalDrugs` and `sampleDrug.name` not always asserted | Low |

**File:** `backend/__tests__/routes/diagnostics.test.js`

---

### Not covered by unit tests (intentional or structural)

| Module | Notes |
|--------|--------|
| `server.js` | Bootstrapping deferred to integration / manual runs |
| `config/database.js` | `process.exit(1)` on failure; integration helper connects directly |
| `models/Drug.js` | Schema never unit-tested; always mocked |
| `app.js` | Full app mount partially covered by integration tests only |

---

## Frontend

### `lib/api.ts`

| Gap | Why it matters | Priority |
|-----|----------------|----------|
| Unset vs whitespace-only `NEXT_PUBLIC_API_URL` | `apiBase()` treats null, empty, and whitespace as same-origin; only empty string tested | Low |
| Special-character encoding beyond space | e.g. `&`, `?` in query strings | Low |
| `fetch` throws (network error) | Only `response.ok === false` is tested | Low |

**File:** `frontend/__tests__/lib/api.test.ts`

---

### `components/SearchBar.tsx`

| Gap | Why it matters | Priority |
|-----|----------------|----------|
| Enter key form submit | Only button click tested; test name says "form submit" | Low |
| Input disabled when `isLoading` | Button disabled is tested; input is not | Low |
| Untrimmed query passed to `onSearch` | Matches current code (`query` not `query.trim()`); plan wording said "trimmed" — test is honest but product behavior may be wrong | Low |

**File:** `frontend/__tests__/components/SearchBar.test.tsx`

---

### `components/SearchTypeSelector.tsx`

| Gap | Why it matters | Priority |
|-----|----------------|----------|
| Active state via Tailwind classes | `border-blue-500`, `bg-blue-50` — brittle; design tweak breaks test without breaking behavior | Low |

**Recommendation:** Prefer semantic attributes (`aria-pressed`, `data-selected`) if added to component.

**File:** `frontend/__tests__/components/SearchTypeSelector.test.tsx`

---

### `components/ResultsList.tsx`

| Gap | Why it matters | Priority |
|-----|----------------|----------|
| Multiple results count (`Found N medications` for N > 1) | Only single result tested | Low |
| `searchTime` omitted when undefined | Header should hide timing; not tested | Low |
| Results without `_id` use index as React key | Fallback key path untested | Low |

**File:** `frontend/__tests__/components/ResultsList.test.tsx`

---

### `components/DrugCard.tsx`

| Gap | Why it matters | Priority |
|-----|----------------|----------|
| Score badge when `showScore={true}` and `drug.score` set | Visible in UI | Medium |
| "Show Details" expand/collapse | Side effects, interactions, keywords sections | Medium |
| Tier labels 1–5 | Only tier 1 and unknown tier tested | Low |
| `showScore={false}` | Prop behavior untested | Low |

**File:** `frontend/__tests__/components/DrugCard.test.tsx`

---

### `app/page.tsx`

| Gap | Why it matters | Priority |
|-----|----------------|----------|
| **`vectorSearch` / `fullTextSearch` as primary path** | Only hybrid search exercised on submit | Medium |
| **Search type switch test encodes a bug** | After clicking Vector Search, test expects `hybridSearch` again due to stale `handleSearch` closure in `handleSearchTypeChange` — passes today but wrong product behavior | **High** |
| Example query chips ("Try: diabetes medication…") | User-facing shortcuts untested | Low |
| Loading state during search | Skeleton/spinner not asserted on page | Low |
| Error cleared on successful re-search | Error banner persistence untested | Low |

**Files:** `frontend/__tests__/app/page.test.tsx`, `frontend/app/page.tsx` (lines 54–62)

---

### Not covered by unit tests

| Module | Notes |
|--------|--------|
| `app/layout.tsx` | Root layout untested |
| `next.config.ts` | Rewrite/proxy config untested (integration/E2E concern) |

---

## Known bugs exposed by gap analysis

These are **production issues** that new or updated unit tests should either fix-and-lock or document explicitly:

1. **Tier validation (`routes/drugs.js`)** — Non-numeric tier strings (e.g. `/tier/abc`) are not rejected; `parseInt` yields `NaN` which passes `tier < 1 \|\| tier > 5`.
2. **Search type re-run (`app/page.tsx`)** — `handleSearchTypeChange` schedules `handleSearch` from a stale closure, so switching to Vector still calls hybrid search. Current page unit test validates this buggy behavior.

---

## Suggested priority order

| Priority | Action |
|----------|--------|
| **High** | Fix tier `NaN` validation + add route test; fix page type-switch bug + update page test to expect `vectorSearch` |
| **Medium** | Route/service error paths; route `searchService(query, limit)` assertions; diagnostics missing embedding; DrugCard details/score; page vector/fulltext paths |
| **Low** | Pipeline detail assertions; api env/encoding edges; SearchBar Enter key; replace brittle class assertions |

---

## Tooling gaps (unit layer)

| Gap | Notes |
|-----|--------|
| No coverage reporting | Neither Jest nor Vitest has `test:coverage` scripts or thresholds configured |
| `TESTING_AND_QUALITY.md` partially stale | Summary matrix still lists "Unit tests: None" in the opening section; unit/integration sections were appended later |

---

## Related docs

- [TESTING_AND_QUALITY.md](./TESTING_AND_QUALITY.md) — overview of all test types
- [backend/__tests__/integration/README.md](./backend/__tests__/integration/README.md) — Atlas integration tests
- Unit tests: `cd backend && npm test`, `cd frontend && npm test`
