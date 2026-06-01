'use client';

import React, { useState, useCallback } from 'react';
import SearchBar from '@/components/SearchBar';
import SearchTypeSelector, { SearchType } from '@/components/SearchTypeSelector';
import ResultsList from '@/components/ResultsList';
import { Drug, vectorSearch, fullTextSearch, hybridSearch } from '@/lib/api';

export default function Home() {
  const [searchType, setSearchType] = useState<SearchType>('hybrid');
  const [results, setResults] = useState<Drug[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTime, setSearchTime] = useState<number | undefined>();
  const [currentQuery, setCurrentQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (query: string, type: SearchType = searchType) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentQuery(query);

    try {
      let response;

      switch (type) {
        case 'vector':
          response = await vectorSearch(query);
          break;
        case 'fulltext':
          response = await fullTextSearch(query);
          break;
        case 'hybrid':
        default:
          response = await hybridSearch(query);
          break;
      }

      setResults(response.results);
      setSearchTime(response.searchTimeMs);
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed. Please make sure the backend server is running.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchType]);

  const handleSearchTypeChange = useCallback((newType: SearchType) => {
    setSearchType(newType);
    if (currentQuery.trim()) {
      handleSearch(currentQuery, newType);
    }
  }, [currentQuery, handleSearch]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-blue-600">Optum RX</span> Drug Matcher
              </h1>
              <p className="text-gray-600 mt-1">
                Powered by MongoDB Vector Search & GenAI
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-700">United Health Group</div>
                <div className="text-xs text-gray-500">Demo Application</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Find the Right Medication
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Search through 1,000+ medications using advanced AI-powered search. 
            Find alternatives, compare costs, and discover therapeutically similar drugs.
          </p>
        </div>

        {/* Search Type Selector */}
        <div className="mb-8">
          <SearchTypeSelector
            selectedType={searchType}
            onTypeChange={handleSearchTypeChange}
          />
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search by drug name, condition, or therapeutic class..."
            isLoading={isLoading}
          />
          
          {/* Example Queries */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="text-sm text-gray-600">Try:</span>
            {['diabetes medication', 'Lipitor', 'blood pressure', 'pain relief', 'metformin alternatives'].map((example) => (
              <button
                key={example}
                onClick={() => handleSearch(example)}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-blue-400 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        <ResultsList
          results={results}
          isLoading={isLoading}
          searchType={searchType}
          searchTime={searchTime}
          query={currentQuery}
        />

        {/* Features Section */}
        {!currentQuery && !isLoading && (
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Vector Search</h3>
              <p className="text-gray-600 text-sm">
                Semantic understanding powered by VoyageAI embeddings finds therapeutically similar medications
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Full-Text Search</h3>
              <p className="text-gray-600 text-sm">
                Exact and fuzzy matching on drug names, brands, and keywords for precise results
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="inline-block p-3 bg-purple-100 rounded-full mb-4">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Hybrid Search</h3>
              <p className="text-gray-600 text-sm">
                Best of both worlds using MongoDB's $rankFusion for optimal search results
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
          <p className="mb-2">
            Demo Application for <span className="font-semibold">Optum RX @ United Health Group</span>
          </p>
          <p className="text-sm">
            Showcasing MongoDB Vector Search, Full-Text Search, Hybrid Search, and VoyageAI Embeddings
          </p>
        </div>
      </footer>
    </main>
  );
}
