'use client';

import React from 'react';

export type SearchType = 'hybrid' | 'vector' | 'fulltext';

interface SearchTypeSelectorProps {
  selectedType: SearchType;
  onTypeChange: (type: SearchType) => void;
}

export default function SearchTypeSelector({ selectedType, onTypeChange }: SearchTypeSelectorProps) {
  const searchTypes: { value: SearchType; label: string; description: string }[] = [
    {
      value: 'hybrid',
      label: 'Hybrid Search',
      description: 'Best of both: exact matches + semantic understanding'
    },
    {
      value: 'vector',
      label: 'Vector Search',
      description: 'Semantic similarity based on meaning'
    },
    {
      value: 'fulltext',
      label: 'Full-Text Search',
      description: 'Exact and fuzzy name matching'
    }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {searchTypes.map((type) => (
        <button
          key={type.value}
          onClick={() => onTypeChange(type.value)}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            selectedType === type.value
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="text-left">
            <div className={`font-semibold ${selectedType === type.value ? 'text-blue-700' : 'text-gray-800'}`}>
              {type.label}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {type.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}


