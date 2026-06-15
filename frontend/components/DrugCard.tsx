'use client';

import React, { useState } from 'react';
import { Drug } from '@/lib/api';

interface DrugCardProps {
  drug: Drug;
  showScore?: boolean;
}

export default function DrugCard({ drug, showScore = true }: DrugCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getTierColor = (tier: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800 border-green-300',
      2: 'bg-blue-100 text-blue-800 border-blue-300',
      3: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      4: 'bg-orange-100 text-orange-800 border-orange-300',
      5: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[tier as keyof typeof colors] || colors[3];
  };

  const getTierLabel = (tier: number) => {
    const labels = {
      1: 'Tier 1 - Preferred Generic',
      2: 'Tier 2 - Generic',
      3: 'Tier 3 - Preferred Brand',
      4: 'Tier 4 - Non-Preferred',
      5: 'Tier 5 - Specialty',
    };
    return labels[tier as keyof typeof labels] || `Tier ${tier}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {drug.drug_name}
          </h3>
          <p className="text-gray-600">
            Generic: <span className="font-semibold">{drug.generic_name}</span>
          </p>
          {drug.brand_names && drug.brand_names.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Brand names: {drug.brand_names.join(', ')}
            </p>
          )}
        </div>
        {showScore && drug.score !== undefined && (
          <div className="ml-4 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
            Score: {drug.score.toFixed(3)}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(drug.formulary_tier)}`}>
          {getTierLabel(drug.formulary_tier)}
        </span>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-300">
          ${drug.average_cost.toFixed(2)}/month
        </span>
      </div>

      {/* Therapeutic Class */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium">
          {drug.therapeutic_class}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4 line-clamp-3">
        {drug.description}
      </p>

      {/* Dosages */}
      {drug.common_dosages && drug.common_dosages.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Common dosages:</span> {drug.common_dosages.join(', ')}
          </p>
        </div>
      )}

      {/* Toggle Details Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
      >
        {showDetails ? '▼ Hide Details' : '▶ Show Details'}
      </button>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          {/* Side Effects */}
          {drug.side_effects && drug.side_effects.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Common Side Effects:</h4>
              <div className="flex flex-wrap gap-2">
                {drug.side_effects.map((effect, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs"
                  >
                    {effect}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interactions */}
          {drug.interactions && drug.interactions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Drug Interactions:</h4>
              <div className="flex flex-wrap gap-2">
                {drug.interactions.map((interaction, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs"
                  >
                    {interaction}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {drug.keywords && drug.keywords.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Keywords:</h4>
              <div className="flex flex-wrap gap-2">
                {drug.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



