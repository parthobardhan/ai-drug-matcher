const { getIntegrationAgent } = require('./helpers/app');
const { useIntegrationLifecycle } = require('./helpers/lifecycle');
const { discoverSampleDrugId } = require('./helpers/discover');
const {
  SEARCH_QUERIES,
  REQUIRED_DRUG_FIELDS,
  isDiabetesRelated,
  resultMatchesDrugName,
  assertSearchEnvelope,
} = require('./fixtures/expectations');

describe('Drug search integration (Atlas + VoyageAI)', () => {
  useIntegrationLifecycle();

  describe('GET /api/drugs/search/vector', () => {
    it('returns vector search results for diabetes query', async () => {
      const query = SEARCH_QUERIES.vectorDiabetes;
      const res = await getIntegrationAgent()
        .get('/api/drugs/search/vector')
        .query({ query, limit: 5 });

      expect(res.status).toBe(200);
      assertSearchEnvelope(res.body, 'vector', query);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
      expect(res.body.results[0].score).toBeDefined();

      const hasRelevantResult = res.body.results.some(isDiabetesRelated);
      expect(hasRelevantResult).toBe(true);
    });

    it('returns 400 when query is missing', async () => {
      const res = await getIntegrationAgent().get('/api/drugs/search/vector');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Query parameter is required' });
    });

    it('respects limit query parameter', async () => {
      const res = await getIntegrationAgent()
        .get('/api/drugs/search/vector')
        .query({ query: SEARCH_QUERIES.vectorDiabetes, limit: 2 });

      expect(res.status).toBe(200);
      expect(res.body.count).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/drugs/search/fulltext', () => {
    it('returns fulltext results matching metformin', async () => {
      const query = SEARCH_QUERIES.fulltextMetformin;
      const res = await getIntegrationAgent()
        .get('/api/drugs/search/fulltext')
        .query({ query, limit: 5 });

      expect(res.status).toBe(200);
      assertSearchEnvelope(res.body, 'fulltext', query);
      expect(res.body.count).toBeGreaterThanOrEqual(1);

      const hasMetformin = res.body.results.some((drug) =>
        resultMatchesDrugName(drug, 'metformin')
      );
      expect(hasMetformin).toBe(true);
    });

    it('returns fulltext results matching Lipitor', async () => {
      const query = SEARCH_QUERIES.fulltextLipitor;
      const res = await getIntegrationAgent()
        .get('/api/drugs/search/fulltext')
        .query({ query, limit: 5 });

      expect(res.status).toBe(200);
      assertSearchEnvelope(res.body, 'fulltext', query);
      expect(res.body.count).toBeGreaterThanOrEqual(1);

      const hasLipitor = res.body.results.some((drug) =>
        resultMatchesDrugName(drug, 'lipitor|atorvastatin')
      );
      expect(hasLipitor).toBe(true);
    });

    it('returns 400 when query is missing', async () => {
      const res = await getIntegrationAgent().get('/api/drugs/search/fulltext');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Query parameter is required' });
    });
  });

  describe('GET /api/drugs/search/hybrid', () => {
    it('returns hybrid search results', async () => {
      const query = SEARCH_QUERIES.hybridHeart;
      const res = await getIntegrationAgent()
        .get('/api/drugs/search/hybrid')
        .query({ query, limit: 5 });

      expect(res.status).toBe(200);
      assertSearchEnvelope(res.body, 'hybrid', query);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });

    it('returns 400 when query is missing', async () => {
      const res = await getIntegrationAgent().get('/api/drugs/search/hybrid');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Query parameter is required' });
    });

    it('respects limit query parameter', async () => {
      const res = await getIntegrationAgent()
        .get('/api/drugs/search/hybrid')
        .query({ query: SEARCH_QUERIES.hybridHeart, limit: 2 });

      expect(res.status).toBe(200);
      expect(res.body.count).toBeLessThanOrEqual(2);
    });
  });
});

describe('Drug search wiring integration', () => {
  useIntegrationLifecycle();

  it('vector and fulltext searches return consistent envelopes via real services', async () => {
    const agent = getIntegrationAgent();
    const query = SEARCH_QUERIES.fulltextMetformin;

    const [vectorRes, fulltextRes] = await Promise.all([
      agent.get('/api/drugs/search/vector').query({ query, limit: 3 }),
      agent.get('/api/drugs/search/fulltext').query({ query, limit: 3 }),
    ]);

    expect(vectorRes.status).toBe(200);
    expect(fulltextRes.status).toBe(200);
    expect(vectorRes.body.searchType).toBe('vector');
    expect(fulltextRes.body.searchType).toBe('fulltext');
    expect(typeof vectorRes.body.searchTimeMs).toBe('number');
    expect(typeof fulltextRes.body.searchTimeMs).toBe('number');
    expect(vectorRes.body.count).toBe(vectorRes.body.results.length);
    expect(fulltextRes.body.count).toBe(fulltextRes.body.results.length);
  });
});
