import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResultsList from '@/components/ResultsList';
import { mockDrug } from '../fixtures/drugs';

describe('ResultsList', () => {
  it('renders loading skeleton when isLoading', () => {
    render(
      <ResultsList results={[]} isLoading={true} query="diabetes" />
    );

    expect(screen.getByText('Searching...')).toBeInTheDocument();
    expect(screen.queryByText('Search Results')).not.toBeInTheDocument();
  });

  it('renders results header with count and search time', () => {
    render(
      <ResultsList
        results={[mockDrug]}
        isLoading={false}
        searchType="hybrid"
        searchTime={42}
        query="diabetes"
      />
    );

    expect(screen.getByText('Search Results')).toBeInTheDocument();
    expect(screen.getByText(/Found 1 medications/)).toBeInTheDocument();
    expect(screen.getByText(/using hybrid search/)).toBeInTheDocument();
    expect(screen.getByText('42ms')).toBeInTheDocument();
    expect(screen.getByText('Metformin')).toBeInTheDocument();
  });

  it('shows start search message when no query and no results', () => {
    render(<ResultsList results={[]} isLoading={false} />);

    expect(screen.getByText('Start Your Search')).toBeInTheDocument();
  });

  it('shows no results message when query has no matches', () => {
    render(
      <ResultsList results={[]} isLoading={false} query="nonexistent drug xyz" />
    );

    expect(screen.getByText('No Results Found')).toBeInTheDocument();
  });

  it('renders plural count for multiple results', () => {
    const secondDrug = {
      ...mockDrug,
      _id: '507f1f77bcf86cd799439012',
      drug_name: 'Glipizide',
    };

    render(
      <ResultsList
        results={[mockDrug, secondDrug]}
        isLoading={false}
        searchType="vector"
        query="diabetes"
      />
    );

    expect(screen.getByText(/Found 2 medications/)).toBeInTheDocument();
    expect(screen.getByText('Glipizide')).toBeInTheDocument();
  });

  it('omits search time from header when searchTime is undefined', () => {
    render(
      <ResultsList
        results={[mockDrug]}
        isLoading={false}
        searchType="hybrid"
        query="diabetes"
      />
    );

    expect(screen.queryByText(/Search time:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/ms/)).not.toBeInTheDocument();
  });

  it('renders drugs without _id using index as key', () => {
    const drugWithoutId = { ...mockDrug };
    delete (drugWithoutId as { _id?: string })._id;

    render(
      <ResultsList
        results={[drugWithoutId]}
        isLoading={false}
        query="diabetes"
      />
    );

    expect(screen.getByText('Metformin')).toBeInTheDocument();
  });
});
