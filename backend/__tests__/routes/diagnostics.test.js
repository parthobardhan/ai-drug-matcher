jest.mock('../../models/Drug');

const request = require('supertest');
const { createDiagnosticsApp } = require('../helpers/testApp');
const Drug = require('../../models/Drug');
const { mockEmbedding, sampleDrugDocument } = require('../fixtures/drugs');

describe('diagnostics routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createDiagnosticsApp();
  });

  describe('GET /api/diagnostics/embeddings', () => {
    it('returns dimensionsMatch true for 512-dim embedding', async () => {
      Drug.findOne.mockResolvedValue({
        ...sampleDrugDocument,
        description_embedding: mockEmbedding,
      });
      Drug.countDocuments.mockResolvedValue(1000);

      const res = await request(app).get('/api/diagnostics/embeddings');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        totalDrugs: 1000,
        embeddingDimensions: 512,
        expectedDimensions: 512,
        dimensionsMatch: true,
        recommendation: 'Embedding dimensions are correct',
        sampleDrug: {
          name: 'Metformin',
          embeddingDimensions: 512,
        },
      });
    });

    it('returns dimensionsMatch false when description_embedding is missing', async () => {
      Drug.findOne.mockResolvedValue({
        ...sampleDrugDocument,
        description_embedding: undefined,
      });
      Drug.countDocuments.mockResolvedValue(500);

      const res = await request(app).get('/api/diagnostics/embeddings');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        embeddingDimensions: 0,
        dimensionsMatch: false,
        totalDrugs: 500,
        sampleDrug: {
          name: 'Metformin',
          embeddingDimensions: 0,
        },
      });
    });

    it('returns dimensionsMatch false with recommendation for wrong dimensions', async () => {
      const wrongEmbedding = Array.from({ length: 256 }, () => 0.1);
      Drug.findOne.mockResolvedValue({
        ...sampleDrugDocument,
        description_embedding: wrongEmbedding,
      });
      Drug.countDocuments.mockResolvedValue(1000);

      const res = await request(app).get('/api/diagnostics/embeddings');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        success: true,
        embeddingDimensions: 256,
        expectedDimensions: 512,
        dimensionsMatch: false,
      });
      expect(res.body.recommendation).toContain('256 dimensions');
    });

    it('returns success false when database is empty', async () => {
      Drug.findOne.mockResolvedValue(null);

      const res = await request(app).get('/api/diagnostics/embeddings');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: false,
        message: 'No drugs found in database',
        embeddingDimensions: 0,
      });
    });

    it('returns 500 when findOne throws', async () => {
      Drug.findOne.mockRejectedValue(new Error('Connection lost'));

      const res = await request(app).get('/api/diagnostics/embeddings');

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        success: false,
        error: 'Failed to check embeddings',
        message: 'Connection lost',
      });
    });

    it('returns 500 when countDocuments throws', async () => {
      Drug.findOne.mockResolvedValue({
        ...sampleDrugDocument,
        description_embedding: mockEmbedding,
      });
      Drug.countDocuments.mockRejectedValue(new Error('Count failed'));

      const res = await request(app).get('/api/diagnostics/embeddings');

      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({
        success: false,
        error: 'Failed to check embeddings',
        message: 'Count failed',
      });
    });
  });
});
