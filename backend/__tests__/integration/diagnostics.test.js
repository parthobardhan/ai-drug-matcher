const { getIntegrationAgent } = require('./helpers/app');
const { useIntegrationLifecycle } = require('./helpers/lifecycle');
const { EXPECTED_EMBEDDING_DIMENSIONS } = require('../fixtures/drugs');

describe('Diagnostics integration', () => {
  useIntegrationLifecycle();

  it('GET /api/diagnostics/embeddings reports 512-dim seeded data', async () => {
    const res = await getIntegrationAgent().get('/api/diagnostics/embeddings');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      embeddingDimensions: EXPECTED_EMBEDDING_DIMENSIONS,
      expectedDimensions: EXPECTED_EMBEDDING_DIMENSIONS,
      dimensionsMatch: true,
      recommendation: 'Embedding dimensions are correct',
    });
    expect(res.body.totalDrugs).toBeGreaterThan(0);
    expect(res.body.sampleDrug).toMatchObject({
      name: expect.any(String),
      embeddingDimensions: EXPECTED_EMBEDDING_DIMENSIONS,
    });
  });
});
