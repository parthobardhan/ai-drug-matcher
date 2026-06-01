import type { Drug, SearchResponse } from '@/lib/api';

export const mockDrug: Drug = {
  _id: '507f1f77bcf86cd799439011',
  drug_name: 'Metformin',
  generic_name: 'metformin hydrochloride',
  brand_names: ['Glucophage'],
  description: 'Oral antidiabetic medication for type 2 diabetes.',
  therapeutic_class: 'Diabetes',
  formulary_tier: 1,
  average_cost: 12.5,
  common_dosages: ['500mg', '850mg'],
  side_effects: ['nausea', 'diarrhea'],
  interactions: ['contrast dye'],
  keywords: ['diabetes', 'blood sugar'],
  score: 0.92,
};

export const mockSearchResponse: SearchResponse = {
  success: true,
  searchType: 'hybrid',
  query: 'diabetes',
  results: [mockDrug],
  count: 1,
  searchTimeMs: 42,
};
