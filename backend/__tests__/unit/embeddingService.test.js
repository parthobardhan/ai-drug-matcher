jest.mock('axios');

const axios = require('axios');
const {
  generateEmbedding,
  generateEmbeddingsBatch,
  generateEmbeddingsBatchChunked,
  prepareDrugTextForEmbedding,
} = require('../../services/embeddingService');
const { mockEmbedding } = require('../fixtures/drugs');

describe('embeddingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateEmbedding', () => {
    it('returns a 512-dim embedding from VoyageAI response', async () => {
      axios.post.mockResolvedValue({
        data: { data: [{ embedding: mockEmbedding }] },
      });

      const result = await generateEmbedding('diabetes medication');

      expect(result).toHaveLength(512);
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.voyageai.com/v1/embeddings',
        {
          input: 'diabetes medication',
          model: 'voyage-3.5-lite',
          output_dimension: 512,
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: expect.stringMatching(/^Bearer /),
          }),
        })
      );
    });

    it('throws on malformed API response', async () => {
      axios.post.mockResolvedValue({ data: {} });

      await expect(generateEmbedding('test')).rejects.toThrow(
        'Invalid response from VoyageAI API'
      );
    });

    it('propagates axios rejection', async () => {
      const networkError = new Error('Network error');
      axios.post.mockRejectedValue(networkError);

      await expect(generateEmbedding('test')).rejects.toThrow('Network error');
    });
  });

  describe('generateEmbeddingsBatch', () => {
    it('returns multiple embeddings from batch response', async () => {
      const embedding2 = mockEmbedding.map((v) => v + 0.1);
      axios.post.mockResolvedValue({
        data: {
          data: [{ embedding: mockEmbedding }, { embedding: embedding2 }],
        },
      });

      const result = await generateEmbeddingsBatch(['text one', 'text two']);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(512);
      expect(result[1]).toHaveLength(512);
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.voyageai.com/v1/embeddings',
        {
          input: ['text one', 'text two'],
          model: 'voyage-3.5-lite',
          output_dimension: 512,
        },
        expect.any(Object)
      );
    });

    it('throws on malformed batch response', async () => {
      axios.post.mockResolvedValue({ data: {} });

      await expect(generateEmbeddingsBatch(['a'])).rejects.toThrow(
        'Invalid response from VoyageAI API'
      );
    });

    it('propagates axios rejection', async () => {
      axios.post.mockRejectedValue(new Error('Rate limited'));

      await expect(generateEmbeddingsBatch(['a', 'b'])).rejects.toThrow(
        'Rate limited'
      );
    });
  });

  describe('generateEmbeddingsBatchChunked', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('processes texts in chunks and delays between chunks', async () => {
      jest.useFakeTimers();
      const embedding2 = mockEmbedding.map((v) => v + 0.1);
      const embedding3 = mockEmbedding.map((v) => v + 0.2);

      axios.post
        .mockResolvedValueOnce({
          data: {
            data: [{ embedding: mockEmbedding }, { embedding: embedding2 }],
          },
        })
        .mockResolvedValueOnce({
          data: { data: [{ embedding: embedding3 }] },
        });

      const promise = generateEmbeddingsBatchChunked(
        ['text one', 'text two', 'text three'],
        2
      );

      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result).toHaveLength(3);
      expect(axios.post).toHaveBeenCalledTimes(2);
      expect(axios.post.mock.calls[0][1].input).toEqual(['text one', 'text two']);
      expect(axios.post.mock.calls[1][1].input).toEqual(['text three']);
    });

    it('rethrows when a chunk batch fails', async () => {
      axios.post.mockRejectedValue(new Error('Chunk failed'));

      await expect(
        generateEmbeddingsBatchChunked(['a', 'b'], 2)
      ).rejects.toThrow('Chunk failed');
    });
  });

  describe('prepareDrugTextForEmbedding', () => {
    it('joins description, therapeutic class, and keywords', () => {
      const drug = {
        description: 'Oral antidiabetic medication.',
        therapeutic_class: 'Diabetes',
        keywords: ['diabetes', 'blood sugar'],
      };

      const text = prepareDrugTextForEmbedding(drug);

      expect(text).toBe(
        'Oral antidiabetic medication.. Therapeutic class: Diabetes. Used for: diabetes, blood sugar'
      );
    });

    it('throws when keywords are missing', () => {
      const drug = {
        description: 'Oral antidiabetic medication.',
        therapeutic_class: 'Diabetes',
      };

      expect(() => prepareDrugTextForEmbedding(drug)).toThrow();
    });
  });
});
