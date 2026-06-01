const { getIntegrationAgent } = require('./helpers/app');
const { useIntegrationLifecycle } = require('./helpers/lifecycle');

describe('Drug statistics integration', () => {
  useIntegrationLifecycle();

  it('GET /api/drugs/stats/overview returns aggregated stats', async () => {
    const res = await getIntegrationAgent().get('/api/drugs/stats/overview');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.totalDrugs).toBeGreaterThan(0);
    expect(res.body.stats.therapeuticClassesCount).toBeGreaterThan(0);
    expect(Array.isArray(res.body.stats.therapeuticClasses)).toBe(true);
    expect(res.body.stats.therapeuticClasses.length).toBeGreaterThan(0);
    expect(Array.isArray(res.body.stats.avgCostByTier)).toBe(true);
    expect(res.body.stats.avgCostByTier.length).toBeGreaterThan(0);

    const tierEntry = res.body.stats.avgCostByTier[0];
    expect(tierEntry).toMatchObject({
      _id: expect.any(Number),
      avgCost: expect.any(Number),
      count: expect.any(Number),
    });
  });
});
