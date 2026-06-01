jest.mock('../../services/searchService');
jest.mock('../../models/Drug');

const request = require('supertest');
const { createDrugsApp } = require('../helpers/testApp');
const searchService = require('../../services/searchService');
const Drug = require('../../models/Drug');
const {
  mockSearchResults,
  mockStatistics,
  sampleDrugDocument,
  VALID_OBJECT_ID,
} = require('../fixtures/drugs');

describe('drugs routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createDrugsApp();
  });

  describe('GET /api/drugs/search/vector', () => {
    it('returns 200 with vector search results', async () => {
      searchService.vectorSearch.mockResolvedValue(mockSearchResults);

      const res = await request(app)
        .get('/api/drugs/search/vector')
        .query({ query: 'diabetes' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        searchType: 'vector',
        query: 'diabetes',
        count: mockSearchResults.length,
      });
      expect(res.body.results).toEqual(mockSearchResults);
      expect(searchService.vectorSearch).toHaveBeenCalledWith('diabetes', 10);
    });

    it('forwards query and limit to searchService', async () => {
      searchService.vectorSearch.mockResolvedValue(mockSearchResults);

      await request(app)
        .get('/api/drugs/search/vector')
        .query({ query: 'diabetes', limit: '7' });

      expect(searchService.vectorSearch).toHaveBeenCalledWith('diabetes', 7);
    });

    it('returns 400 when query is empty string', async () => {
      const res = await request(app)
        .get('/api/drugs/search/vector')
        .query({ query: '' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Query parameter is required' });
    });

    it('returns 400 when query is missing', async () => {
      const res = await request(app).get('/api/drugs/search/vector');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Query parameter is required' });
    });

    it('returns 500 when vectorSearch throws', async () => {
      searchService.vectorSearch.mockRejectedValue(new Error('DB down'));

      const res = await request(app)
        .get('/api/drugs/search/vector')
        .query({ query: 'diabetes' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: 'Vector search failed',
        message: 'DB down',
      });
    });
  });

  describe('GET /api/drugs/search/fulltext', () => {
    it('returns 200 with fulltext search results', async () => {
      searchService.fullTextSearch.mockResolvedValue(mockSearchResults);

      const res = await request(app)
        .get('/api/drugs/search/fulltext')
        .query({ query: 'metformin' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        searchType: 'fulltext',
        count: mockSearchResults.length,
      });
      expect(searchService.fullTextSearch).toHaveBeenCalledWith('metformin', 10);
    });

    it('forwards query and limit to searchService', async () => {
      searchService.fullTextSearch.mockResolvedValue(mockSearchResults);

      await request(app)
        .get('/api/drugs/search/fulltext')
        .query({ query: 'metformin', limit: '3' });

      expect(searchService.fullTextSearch).toHaveBeenCalledWith('metformin', 3);
    });

    it('returns 400 when query is empty string', async () => {
      const res = await request(app)
        .get('/api/drugs/search/fulltext')
        .query({ query: '' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Query parameter is required' });
    });

    it('returns 400 when query is missing', async () => {
      const res = await request(app).get('/api/drugs/search/fulltext');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Query parameter is required' });
    });

    it('returns 500 when fullTextSearch throws', async () => {
      searchService.fullTextSearch.mockRejectedValue(new Error('Index missing'));

      const res = await request(app)
        .get('/api/drugs/search/fulltext')
        .query({ query: 'metformin' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: 'Full-text search failed',
        message: 'Index missing',
      });
    });
  });

  describe('GET /api/drugs/search/hybrid', () => {
    it('returns 200 with hybrid search results', async () => {
      searchService.hybridSearch.mockResolvedValue(mockSearchResults);

      const res = await request(app)
        .get('/api/drugs/search/hybrid')
        .query({ query: 'heart medication' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        searchType: 'hybrid',
        count: mockSearchResults.length,
      });
      expect(searchService.hybridSearch).toHaveBeenCalledWith('heart medication', 10);
    });

    it('forwards query and limit to searchService', async () => {
      searchService.hybridSearch.mockResolvedValue(mockSearchResults);

      await request(app)
        .get('/api/drugs/search/hybrid')
        .query({ query: 'heart', limit: '5' });

      expect(searchService.hybridSearch).toHaveBeenCalledWith('heart', 5);
    });

    it('returns 400 when query is empty string', async () => {
      const res = await request(app)
        .get('/api/drugs/search/hybrid')
        .query({ query: '' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Query parameter is required' });
    });

    it('returns 400 when query is missing', async () => {
      const res = await request(app).get('/api/drugs/search/hybrid');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Query parameter is required' });
    });

    it('returns 500 when hybridSearch throws', async () => {
      searchService.hybridSearch.mockRejectedValue(new Error('Fusion failed'));

      const res = await request(app)
        .get('/api/drugs/search/hybrid')
        .query({ query: 'heart' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: 'Hybrid search failed',
        message: 'Fusion failed',
      });
    });
  });

  describe('GET /api/drugs/stats/overview', () => {
    it('returns 200 with statistics', async () => {
      searchService.getStatistics.mockResolvedValue(mockStatistics);

      const res = await request(app).get('/api/drugs/stats/overview');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, stats: mockStatistics });
    });

    it('returns 500 when getStatistics throws', async () => {
      searchService.getStatistics.mockRejectedValue(new Error('Stats down'));

      const res = await request(app).get('/api/drugs/stats/overview');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: 'Failed to fetch statistics',
        message: 'Stats down',
      });
    });
  });

  describe('GET /api/drugs/:id', () => {
    it('returns 200 with drug when found', async () => {
      Drug.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(sampleDrugDocument),
      });

      const res = await request(app).get(`/api/drugs/${VALID_OBJECT_ID}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, drug: sampleDrugDocument });
    });

    it('returns 404 when drug not found', async () => {
      Drug.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).get(`/api/drugs/${VALID_OBJECT_ID}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Drug not found' });
    });

    it('returns 500 when findById throws', async () => {
      Drug.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('Cast to ObjectId failed')),
      });

      const res = await request(app).get('/api/drugs/not-a-valid-id');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: 'Failed to fetch drug',
        message: 'Cast to ObjectId failed',
      });
    });
  });

  describe('GET /api/drugs/:id/alternatives', () => {
    it('returns 200 with alternatives count', async () => {
      const alternatives = [{ drug_name: 'Glipizide' }];
      searchService.getAlternatives.mockResolvedValue(alternatives);

      const res = await request(app).get(
        `/api/drugs/${VALID_OBJECT_ID}/alternatives`
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        alternatives,
        count: 1,
      });
    });

    it('returns 500 when getAlternatives throws', async () => {
      searchService.getAlternatives.mockRejectedValue(new Error('Alt failed'));

      const res = await request(app).get(
        `/api/drugs/${VALID_OBJECT_ID}/alternatives`
      );

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: 'Failed to fetch alternatives',
        message: 'Alt failed',
      });
    });
  });

  describe('GET /api/drugs/class/:therapeuticClass', () => {
    it('returns 200 with drugs by class', async () => {
      searchService.getByTherapeuticClass.mockResolvedValue([sampleDrugDocument]);

      const res = await request(app).get('/api/drugs/class/Diabetes');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        therapeuticClass: 'Diabetes',
        count: 1,
      });
    });

    it('returns 500 when getByTherapeuticClass throws', async () => {
      searchService.getByTherapeuticClass.mockRejectedValue(
        new Error('Class failed')
      );

      const res = await request(app).get('/api/drugs/class/Diabetes');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: 'Failed to fetch drugs',
        message: 'Class failed',
      });
    });
  });

  describe('GET /api/drugs/tier/:tier', () => {
    it('returns 200 with drugs by tier', async () => {
      searchService.getByFormularyTier.mockResolvedValue([sampleDrugDocument]);

      const res = await request(app).get('/api/drugs/tier/2');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        formularyTier: 2,
        count: 1,
      });
    });

    it('returns 400 for tier 0', async () => {
      const res = await request(app).get('/api/drugs/tier/0');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Tier must be between 1 and 5' });
    });

    it('returns 400 for tier 6', async () => {
      const res = await request(app).get('/api/drugs/tier/6');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Tier must be between 1 and 5' });
    });

    // Known bug: parseInt('abc') is NaN; NaN < 1 and NaN > 5 are both false.
    it('does not reject non-numeric tier strings (NaN bypasses validation)', async () => {
      searchService.getByFormularyTier.mockResolvedValue([sampleDrugDocument]);

      const res = await request(app).get('/api/drugs/tier/abc');

      expect(res.status).toBe(200);
      expect(searchService.getByFormularyTier).toHaveBeenCalledWith(
        NaN,
        20
      );
    });

    it('returns 500 when getByFormularyTier throws', async () => {
      searchService.getByFormularyTier.mockRejectedValue(new Error('Tier failed'));

      const res = await request(app).get('/api/drugs/tier/2');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: 'Failed to fetch drugs',
        message: 'Tier failed',
      });
    });
  });
});
