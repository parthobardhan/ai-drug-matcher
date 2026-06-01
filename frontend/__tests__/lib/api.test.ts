import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockSearchResponse } from '../fixtures/drugs';

const fetchMock = vi.fn();

describe('api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  function mockOkJson(data: unknown) {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data),
    });
  }

  function mockNotOk() {
    fetchMock.mockResolvedValue({ ok: false });
  }

  describe('with whitespace-only NEXT_PUBLIC_API_URL', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_API_URL', '   ');
    });

    it('treats whitespace as same-origin path', async () => {
      mockOkJson(mockSearchResponse);
      const { vectorSearch } = await import('@/lib/api');

      await vectorSearch('diabetes');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/drugs/search/vector?query=diabetes&limit=10'
      );
    });
  });

  describe('with empty NEXT_PUBLIC_API_URL', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    });

    it('vectorSearch uses same-origin path', async () => {
      mockOkJson(mockSearchResponse);
      const { vectorSearch } = await import('@/lib/api');

      await vectorSearch('diabetes medication', 5);

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/drugs/search/vector?query=diabetes%20medication&limit=5'
      );
    });

    it('encodes special characters in query strings', async () => {
      mockOkJson(mockSearchResponse);
      const { vectorSearch } = await import('@/lib/api');

      await vectorSearch('a&b?c');

      expect(fetchMock).toHaveBeenCalledWith(
        `/api/drugs/search/vector?query=${encodeURIComponent('a&b?c')}&limit=10`
      );
    });

    it('fullTextSearch uses same-origin path', async () => {
      mockOkJson(mockSearchResponse);
      const { fullTextSearch } = await import('@/lib/api');

      await fullTextSearch('metformin');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/drugs/search/fulltext?query=metformin&limit=10'
      );
    });

    it('hybridSearch uses same-origin path', async () => {
      mockOkJson(mockSearchResponse);
      const { hybridSearch } = await import('@/lib/api');

      await hybridSearch('heart');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/drugs/search/hybrid?query=heart&limit=10'
      );
    });

    it('getDrugById uses same-origin path', async () => {
      mockOkJson({ success: true, drug: {} });
      const { getDrugById } = await import('@/lib/api');

      await getDrugById('507f1f77bcf86cd799439011');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/drugs/507f1f77bcf86cd799439011'
      );
    });

    it('getDrugAlternatives uses same-origin path', async () => {
      mockOkJson({ success: true, alternatives: [], count: 0 });
      const { getDrugAlternatives } = await import('@/lib/api');

      await getDrugAlternatives('507f1f77bcf86cd799439011');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/drugs/507f1f77bcf86cd799439011/alternatives'
      );
    });

    it('getStatistics uses same-origin path', async () => {
      mockOkJson({ success: true, stats: {} });
      const { getStatistics } = await import('@/lib/api');

      await getStatistics();

      expect(fetchMock).toHaveBeenCalledWith('/api/drugs/stats/overview');
    });

    it('healthCheck uses same-origin path', async () => {
      mockOkJson({ status: 'ok' });
      const { healthCheck } = await import('@/lib/api');

      await healthCheck();

      expect(fetchMock).toHaveBeenCalledWith('/health');
    });
  });

  describe('with NEXT_PUBLIC_API_URL set', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:5001/');
    });

    it('applies API base URL with trailing slash stripped', async () => {
      mockOkJson(mockSearchResponse);
      const { vectorSearch } = await import('@/lib/api');

      await vectorSearch('diabetes');

      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:5001/api/drugs/search/vector?query=diabetes&limit=10'
      );
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    });

    it('throws when vector search fails', async () => {
      mockNotOk();
      const { vectorSearch } = await import('@/lib/api');

      await expect(vectorSearch('x')).rejects.toThrow('Vector search failed');
    });

    it('throws when full-text search fails', async () => {
      mockNotOk();
      const { fullTextSearch } = await import('@/lib/api');

      await expect(fullTextSearch('x')).rejects.toThrow('Full-text search failed');
    });

    it('throws when hybrid search fails', async () => {
      mockNotOk();
      const { hybridSearch } = await import('@/lib/api');

      await expect(hybridSearch('x')).rejects.toThrow('Hybrid search failed');
    });

    it('throws when getDrugById fails', async () => {
      mockNotOk();
      const { getDrugById } = await import('@/lib/api');

      await expect(getDrugById('id')).rejects.toThrow('Failed to fetch drug');
    });

    it('throws when getDrugAlternatives fails', async () => {
      mockNotOk();
      const { getDrugAlternatives } = await import('@/lib/api');

      await expect(getDrugAlternatives('id')).rejects.toThrow(
        'Failed to fetch alternatives'
      );
    });

    it('throws when getStatistics fails', async () => {
      mockNotOk();
      const { getStatistics } = await import('@/lib/api');

      await expect(getStatistics()).rejects.toThrow('Failed to fetch statistics');
    });

    it('throws when healthCheck fails', async () => {
      mockNotOk();
      const { healthCheck } = await import('@/lib/api');

      await expect(healthCheck()).rejects.toThrow('Health check failed');
    });

    it('throws when fetch rejects with a network error', async () => {
      fetchMock.mockRejectedValue(new Error('Failed to fetch'));
      const { hybridSearch } = await import('@/lib/api');

      await expect(hybridSearch('diabetes')).rejects.toThrow('Failed to fetch');
    });
  });

  describe('response parsing', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    });

    it('parses JSON from successful search response', async () => {
      mockOkJson(mockSearchResponse);
      const { hybridSearch } = await import('@/lib/api');

      const result = await hybridSearch('diabetes');

      expect(result).toEqual(mockSearchResponse);
    });
  });
});
