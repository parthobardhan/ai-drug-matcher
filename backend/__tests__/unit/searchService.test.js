jest.mock('../../models/Drug');
jest.mock('../../services/embeddingService');

const Drug = require('../../models/Drug');
const { generateEmbedding } = require('../../services/embeddingService');
const {
  vectorSearch,
  fullTextSearch,
  hybridSearch,
  getAlternatives,
  getByTherapeuticClass,
  getByFormularyTier,
  getStatistics,
} = require('../../services/searchService');
const {
  mockEmbedding,
  mockSearchResults,
  mockStatistics,
  sampleDrugDocument,
  VALID_OBJECT_ID,
} = require('../fixtures/drugs');

describe('searchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    generateEmbedding.mockResolvedValue(mockEmbedding);
  });

  describe('vectorSearch', () => {
    it('generates embedding and runs $vectorSearch aggregate', async () => {
      Drug.aggregate.mockResolvedValue(mockSearchResults);

      const results = await vectorSearch('diabetes', 5);

      expect(generateEmbedding).toHaveBeenCalledWith('diabetes');
      expect(Drug.aggregate).toHaveBeenCalled();
      const pipeline = Drug.aggregate.mock.calls[0][0];
      expect(pipeline[0].$vectorSearch).toEqual(
        expect.objectContaining({
          index: 'drug_vector_index',
          path: 'description_embedding',
          queryVector: mockEmbedding,
          limit: 5,
        })
      );
      expect(results).toEqual(mockSearchResults);
    });

    it('rethrows when Drug.aggregate throws', async () => {
      Drug.aggregate.mockRejectedValue(new Error('Aggregate failed'));

      await expect(vectorSearch('diabetes')).rejects.toThrow('Aggregate failed');
    });

    it('rethrows when generateEmbedding fails', async () => {
      generateEmbedding.mockRejectedValue(new Error('VoyageAI down'));

      await expect(vectorSearch('diabetes')).rejects.toThrow('VoyageAI down');
    });
  });

  describe('fullTextSearch', () => {
    it('runs $search without calling generateEmbedding', async () => {
      Drug.aggregate.mockResolvedValue(mockSearchResults);

      const results = await fullTextSearch('metformin', 10);

      expect(generateEmbedding).not.toHaveBeenCalled();
      const pipeline = Drug.aggregate.mock.calls[0][0];
      expect(pipeline[0].$search).toEqual(
        expect.objectContaining({
          index: 'drug_text_index',
          text: expect.objectContaining({
            query: 'metformin',
            path: ['drug_name', 'generic_name', 'brand_names', 'keywords'],
            fuzzy: { maxEdits: 2, prefixLength: 2 },
          }),
        })
      );
      expect(pipeline[1].$limit).toBe(10);
      expect(results).toEqual(mockSearchResults);
    });

    it('rethrows when Drug.aggregate throws', async () => {
      Drug.aggregate.mockRejectedValue(new Error('Full-text failed'));

      await expect(fullTextSearch('metformin')).rejects.toThrow('Full-text failed');
    });
  });

  describe('hybridSearch', () => {
    it('generates embedding and runs $rankFusion pipeline', async () => {
      Drug.aggregate.mockResolvedValue(mockSearchResults);

      const results = await hybridSearch('heart medication', 8);

      expect(generateEmbedding).toHaveBeenCalledWith('heart medication');
      const pipeline = Drug.aggregate.mock.calls[0][0];
      expect(pipeline[0].$rankFusion).toBeDefined();
      expect(
        pipeline[0].$rankFusion.input.pipelines.vectorSearch[0].$vectorSearch
      ).toEqual(
        expect.objectContaining({
          index: 'drug_vector_index',
          queryVector: mockEmbedding,
        })
      );
      expect(
        pipeline[0].$rankFusion.input.pipelines.fullTextSearch[0].$search
      ).toEqual(
        expect.objectContaining({
          index: 'drug_text_index',
        })
      );
      expect(results).toEqual(mockSearchResults);
    });

    it('rethrows when Drug.aggregate throws', async () => {
      Drug.aggregate.mockRejectedValue(new Error('Hybrid failed'));

      await expect(hybridSearch('heart')).rejects.toThrow('Hybrid failed');
    });

    it('rethrows when generateEmbedding fails', async () => {
      generateEmbedding.mockRejectedValue(new Error('VoyageAI rate limited'));

      await expect(hybridSearch('heart')).rejects.toThrow('VoyageAI rate limited');
    });
  });

  describe('getAlternatives', () => {
    it('returns populated alternatives when drug exists', async () => {
      const alternatives = [{ drug_name: 'Glipizide' }];
      Drug.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ alternatives }),
      });

      const result = await getAlternatives(VALID_OBJECT_ID);

      expect(Drug.findById).toHaveBeenCalledWith(VALID_OBJECT_ID);
      expect(result).toEqual(alternatives);
    });

    it('returns empty array when drug not found', async () => {
      Drug.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const result = await getAlternatives(VALID_OBJECT_ID);

      expect(result).toEqual([]);
    });

    it('rethrows when findById throws', async () => {
      Drug.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(getAlternatives(VALID_OBJECT_ID)).rejects.toThrow('DB error');
    });
  });

  describe('getByTherapeuticClass', () => {
    it('delegates to Drug.find with therapeutic class filter', async () => {
      const limit = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([sampleDrugDocument]),
      });
      Drug.find.mockReturnValue({ limit });

      const results = await getByTherapeuticClass('Diabetes', 20);

      expect(Drug.find).toHaveBeenCalledWith({ therapeutic_class: 'Diabetes' });
      expect(limit).toHaveBeenCalledWith(20);
      expect(limit().sort).toHaveBeenCalledWith({ average_cost: 1 });
      expect(results).toEqual([sampleDrugDocument]);
    });

    it('rethrows when Drug.find throws', async () => {
      Drug.find.mockImplementation(() => {
        throw new Error('Find failed');
      });

      await expect(getByTherapeuticClass('Diabetes')).rejects.toThrow('Find failed');
    });
  });

  describe('getByFormularyTier', () => {
    it('delegates to Drug.find with tier filter', async () => {
      const limit = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([sampleDrugDocument]),
      });
      Drug.find.mockReturnValue({ limit });

      const results = await getByFormularyTier(2, 15);

      expect(Drug.find).toHaveBeenCalledWith({ formulary_tier: 2 });
      expect(limit).toHaveBeenCalledWith(15);
      expect(limit().sort).toHaveBeenCalledWith({ average_cost: 1 });
      expect(results).toEqual([sampleDrugDocument]);
    });

    it('rethrows when Drug.find throws', async () => {
      Drug.find.mockImplementation(() => {
        throw new Error('Tier find failed');
      });

      await expect(getByFormularyTier(2)).rejects.toThrow('Tier find failed');
    });
  });

  describe('getStatistics', () => {
    it('returns aggregated statistics', async () => {
      Drug.countDocuments.mockResolvedValue(mockStatistics.totalDrugs);
      Drug.distinct.mockResolvedValue(mockStatistics.therapeuticClasses);
      Drug.aggregate.mockResolvedValue(mockStatistics.avgCostByTier);

      const stats = await getStatistics();

      expect(stats.totalDrugs).toBe(mockStatistics.totalDrugs);
      expect(stats.therapeuticClasses).toEqual(mockStatistics.therapeuticClasses);
      expect(stats.therapeuticClassesCount).toBe(mockStatistics.therapeuticClasses.length);
      expect(stats.avgCostByTier).toEqual(mockStatistics.avgCostByTier);
      expect(Drug.countDocuments).toHaveBeenCalled();
      expect(Drug.distinct).toHaveBeenCalledWith('therapeutic_class');
      expect(Drug.aggregate).toHaveBeenCalled();
    });

    it('rethrows when countDocuments throws', async () => {
      Drug.countDocuments.mockRejectedValue(new Error('Stats failed'));

      await expect(getStatistics()).rejects.toThrow('Stats failed');
    });
  });
});
