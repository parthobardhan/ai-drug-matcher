const { getIntegrationAgent } = require('./helpers/app');
const { useIntegrationLifecycle } = require('./helpers/lifecycle');
const { discoverSampleDrugId } = require('./helpers/discover');
const { REQUIRED_DRUG_FIELDS, SEEDED_THERAPEUTIC_CLASS } = require('./fixtures/expectations');

describe('Drug read integration', () => {
  useIntegrationLifecycle();

  let sampleDrugId;

  beforeAll(async () => {
    sampleDrugId = await discoverSampleDrugId(getIntegrationAgent());
  });

  it('GET /api/drugs/:id returns drug detail', async () => {
    const res = await getIntegrationAgent().get(`/api/drugs/${sampleDrugId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.drug).toBeDefined();

    for (const field of REQUIRED_DRUG_FIELDS) {
      expect(res.body.drug[field]).toBeDefined();
    }
  });

  it('GET /api/drugs/:id/alternatives returns alternatives array', async () => {
    const res = await getIntegrationAgent().get(
      `/api/drugs/${sampleDrugId}/alternatives`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.alternatives)).toBe(true);
    expect(res.body.count).toBe(res.body.alternatives.length);
  });

  it('GET /api/drugs/class/:therapeuticClass returns drugs in that class', async () => {
    const res = await getIntegrationAgent().get(
      `/api/drugs/class/${encodeURIComponent(SEEDED_THERAPEUTIC_CLASS)}`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.therapeuticClass).toBe(SEEDED_THERAPEUTIC_CLASS);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(
      res.body.drugs.every((d) => d.therapeutic_class === SEEDED_THERAPEUTIC_CLASS)
    ).toBe(true);
  });

  it('GET /api/drugs/tier/1 returns tier 1 drugs', async () => {
    const res = await getIntegrationAgent().get('/api/drugs/tier/1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.formularyTier).toBe(1);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(res.body.drugs.every((d) => d.formulary_tier === 1)).toBe(true);
  });

  it('GET /api/drugs/:id returns 404 for non-existent id', async () => {
    const res = await getIntegrationAgent().get(
      '/api/drugs/507f1f77bcf86cd799439011'
    );

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Drug not found' });
  });

  it('GET /api/drugs/tier/0 returns 400', async () => {
    const res = await getIntegrationAgent().get('/api/drugs/tier/0');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Tier must be between 1 and 5' });
  });

  it('GET /api/drugs/tier/6 returns 400', async () => {
    const res = await getIntegrationAgent().get('/api/drugs/tier/6');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Tier must be between 1 and 5' });
  });
});
