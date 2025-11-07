'use client';

import React from 'react';
import DrugCard from './DrugCard';
import { Drug } from '@/lib/api';

interface ResultsListProps {
  results: Drug[];
  isLoading: boolean;
  searchType?: string;
  searchTime?: number;
  query?: string;
}

export default function ResultsList({ results, isLoading, searchType, searchTime, query }: ResultsListProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center text-gray-600 mb-4">
          Searching...
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!results || results.length === 0) {
    if (!query) {
      return (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Start Your Search
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Enter a medication name, condition, or therapeutic class to find matching drugs.
            Try searching for "diabetes", "Lipitor", or "blood pressure medication".
          </p>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-24 w-24 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Results Found
        </h3>
        <p className="text-gray-600">
          Try different keywords or search terms.
        </p>
      </div>
    );
  }

  // Results header
  const resultHeader = (
    <div className="mb-6 pb-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Search Results
          </h2>
          <p className="text-gray-600 mt-1">
            Found {results.length} medications
            {searchType && ` using ${searchType} search`}
          </p>
        </div>
        {searchTime !== undefined && (
          <div className="text-sm text-gray-500">
            Search time: <span className="font-semibold">{searchTime}ms</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {resultHeader}
      <div className="space-y-4">
        {results.map((drug, index) => (
          <DrugCard key={drug._id || index} drug={drug} showScore={true} />
        ))}
      </div>
    </div>
  );
}


