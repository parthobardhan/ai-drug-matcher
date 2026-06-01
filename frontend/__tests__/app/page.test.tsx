import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';
import { mockSearchResponse } from '../fixtures/drugs';

vi.mock('@/lib/api', () => ({
  vectorSearch: vi.fn(),
  fullTextSearch: vi.fn(),
  hybridSearch: vi.fn(),
}));

import { vectorSearch, fullTextSearch, hybridSearch } from '@/lib/api';

const mockedHybridSearch = vi.mocked(hybridSearch);
const mockedVectorSearch = vi.mocked(vectorSearch);
const mockedFullTextSearch = vi.mocked(fullTextSearch);

describe('Home page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedHybridSearch.mockResolvedValue(mockSearchResponse);
    mockedVectorSearch.mockResolvedValue({
      ...mockSearchResponse,
      searchType: 'vector',
    });
    mockedFullTextSearch.mockResolvedValue({
      ...mockSearchResponse,
      searchType: 'fulltext',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('performs hybrid search and renders results', async () => {
    const user = userEvent.setup();

    render(<Home />);

    const input = screen.getByPlaceholderText(
      /search by drug name, condition, or therapeutic class/i
    );
    await user.type(input, 'diabetes');
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(mockedHybridSearch).toHaveBeenCalledWith('diabetes');
    });

    await waitFor(() => {
      expect(screen.getByText('Metformin')).toBeInTheDocument();
    });
  });

  it('performs vector search when vector type is selected before submit', async () => {
    const user = userEvent.setup();

    render(<Home />);

    await user.click(screen.getByRole('button', { name: /vector search/i }));

    const input = screen.getByPlaceholderText(
      /search by drug name, condition, or therapeutic class/i
    );
    await user.type(input, 'diabetes');
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(mockedVectorSearch).toHaveBeenCalledWith('diabetes');
    });
    expect(mockedHybridSearch).not.toHaveBeenCalled();
  });

  it('performs full-text search when full-text type is selected before submit', async () => {
    const user = userEvent.setup();

    render(<Home />);

    await user.click(screen.getByRole('button', { name: /full-text search/i }));

    const input = screen.getByPlaceholderText(
      /search by drug name, condition, or therapeutic class/i
    );
    await user.type(input, 'metformin');
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(mockedFullTextSearch).toHaveBeenCalledWith('metformin');
    });
    expect(mockedHybridSearch).not.toHaveBeenCalled();
  });

  it('re-runs vector search when search type changes after initial query', async () => {
    const user = userEvent.setup();

    render(<Home />);

    const input = screen.getByPlaceholderText(
      /search by drug name, condition, or therapeutic class/i
    );
    await user.type(input, 'diabetes');
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(mockedHybridSearch).toHaveBeenCalledWith('diabetes');
    });

    mockedHybridSearch.mockClear();
    mockedVectorSearch.mockClear();

    await user.click(screen.getByRole('button', { name: /vector search/i }));

    await waitFor(() => {
      expect(mockedVectorSearch).toHaveBeenCalledWith('diabetes');
    });
    expect(mockedHybridSearch).not.toHaveBeenCalled();
  });

  it('runs search from example query chip', async () => {
    const user = userEvent.setup();

    render(<Home />);

    await user.click(screen.getByRole('button', { name: 'diabetes medication' }));

    await waitFor(() => {
      expect(mockedHybridSearch).toHaveBeenCalledWith('diabetes medication');
    });
  });

  it('shows loading state while search is in progress', async () => {
    let resolveSearch: (value: typeof mockSearchResponse) => void = () => {};
    mockedHybridSearch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSearch = resolve;
        })
    );

    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(
      /search by drug name, condition, or therapeutic class/i
    );
    await user.type(input, 'diabetes');
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    expect(screen.getAllByText('Searching...').length).toBeGreaterThanOrEqual(2);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();

    resolveSearch(mockSearchResponse);

    await waitFor(() => {
      expect(screen.getByText('Metformin')).toBeInTheDocument();
    });
  });

  it('shows error message when API throws', async () => {
    mockedHybridSearch.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();

    render(<Home />);

    const input = screen.getByPlaceholderText(
      /search by drug name, condition, or therapeutic class/i
    );
    await user.type(input, 'diabetes');
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          'Search failed. Please make sure the backend server is running.'
        )
      ).toBeInTheDocument();
    });
  });

  it('clears error message after a successful re-search', async () => {
    mockedHybridSearch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockSearchResponse);

    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(
      /search by drug name, condition, or therapeutic class/i
    );
    await user.type(input, 'diabetes');
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          'Search failed. Please make sure the backend server is running.'
        )
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(
        screen.queryByText(
          'Search failed. Please make sure the backend server is running.'
        )
      ).not.toBeInTheDocument();
    });
    expect(screen.getByText('Metformin')).toBeInTheDocument();
  });

  it('does not call API for empty query', async () => {
    const user = userEvent.setup();

    render(<Home />);

    const input = screen.getByPlaceholderText(
      /search by drug name, condition, or therapeutic class/i
    );
    await user.type(input, '   ');
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    expect(mockedHybridSearch).not.toHaveBeenCalled();
    expect(screen.getByText('Start Your Search')).toBeInTheDocument();
  });
});
