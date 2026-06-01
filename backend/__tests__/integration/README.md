# Backend integration tests (Atlas-only)

Integration tests exercise the **full stack** in-process: `createApp()` → routes → services → Mongoose → Atlas Search + VoyageAI. No mocks.

Unit tests under `__tests__/unit/` and `__tests__/routes/` remain mock-only and run with `npm test`.

## Prerequisites

1. **MongoDB Atlas** cluster with seeded drugs:
   ```bash
   npm run seed
   ```

2. **Atlas Search indexes** (see project root `INDEX_SETUP.md`):
   - `drug_vector_index` on `description_embedding`
   - `drug_text_index` on drug names and keywords

3. **Environment variables** in `backend/.env`:
   | Variable | Required | Purpose |
   |----------|----------|---------|
   | `MONGODB_URI` | Yes | Atlas connection string |
   | `VOYAGEAI_API_KEY` | Yes | Vector and hybrid search |
   | `DB_NAME` | No | Database name (default: `Optum`) |
   | `COLLECTION_NAME` | No | Collection (default: `drugs`) |
   | `RUN_INTEGRATION_TESTS` | Yes | Must be `1` to run suite |

**Recommendation:** Use a dedicated database for integration (e.g. `DB_NAME=OptumIntegration`) so tests do not interfere with local dev data. Tests are **read-only** (GET requests only).

## Run

```bash
cd backend

# Unit tests only (no Atlas/VoyageAI needed)
npm test

# Integration tests (requires env above)
RUN_INTEGRATION_TESTS=1 npm run test:integration

# Both
RUN_INTEGRATION_TESTS=1 npm run test:all
```

If `RUN_INTEGRATION_TESTS` is not `1` or `MONGODB_URI` is missing, integration tests are **skipped** with a console message.

## Test files

| File | Coverage |
|------|----------|
| `health.app.test.js` | `/health`, 404 handler |
| `diagnostics.test.js` | Embedding dimension diagnostic |
| `drugs.stats.test.js` | Statistics overview |
| `drugs.search.test.js` | Vector, fulltext, hybrid search + validation |
| `drugs.read.test.js` | Get by id, alternatives, class, tier |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| All tests skipped | Set `RUN_INTEGRATION_TESTS=1` and `MONGODB_URI` |
| "Integration database has no drugs" | Run `npm run seed` |
| Vector search 500 | Create `drug_vector_index` in Atlas; verify `VOYAGEAI_API_KEY` |
| Fulltext search empty / 500 | Create `drug_text_index` in Atlas |
| `dimensionsMatch: false` | Re-seed with 512-dim embeddings or update index dimensions |
| Connection errors | Check `MONGODB_URI`, IP allowlist, and credentials |

## CI

Run integration tests on **manual dispatch or nightly** with secrets for `MONGODB_URI` and `VOYAGEAI_API_KEY`. Do not block PR unit-test CI on Atlas availability.
