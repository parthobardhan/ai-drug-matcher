const VALID_OBJECT_ID = '507f1f77bcf86cd799439011';

const EXPECTED_EMBEDDING_DIMENSIONS = 512;

const mockEmbedding = Array.from({ length: EXPECTED_EMBEDDING_DIMENSIONS }, (_, i) => i / 512);

const sampleDrugDocument = {
  _id: VALID_OBJECT_ID,
  drug_name: 'Metformin',
  generic_name: 'metformin hydrochloride',
  brand_names: ['Glucophage'],
  description: 'Oral antidiabetic medication for type 2 diabetes.',
  description_embedding: mockEmbedding,
  therapeutic_class: 'Diabetes',
  formulary_tier: 1,
  average_cost: 12.5,
  common_dosages: ['500mg', '850mg', '1000mg'],
  side_effects: ['nausea', 'diarrhea'],
  interactions: ['contrast dye'],
  keywords: ['diabetes', 'blood sugar', 'type 2 diabetes'],
  alternatives: [],
};

const mockSearchResults = [
  {
    drug_name: 'Metformin',
    generic_name: 'metformin hydrochloride',
    brand_names: ['Glucophage'],
    description: 'Oral antidiabetic medication for type 2 diabetes.',
    therapeutic_class: 'Diabetes',
    formulary_tier: 1,
    average_cost: 12.5,
    common_dosages: ['500mg'],
    side_effects: ['nausea'],
    interactions: [],
    keywords: ['diabetes'],
    alternatives: [],
    score: 0.92,
  },
];

const mockStatistics = {
  totalDrugs: 1000,
  therapeuticClassesCount: 25,
  therapeuticClasses: ['Diabetes', 'Cardiovascular'],
  avgCostByTier: [
    { _id: 1, avgCost: 15.5, count: 200 },
    { _id: 2, avgCost: 45.0, count: 300 },
  ],
};

module.exports = {
  VALID_OBJECT_ID,
  EXPECTED_EMBEDDING_DIMENSIONS,
  mockEmbedding,
  sampleDrugDocument,
  mockSearchResults,
  mockStatistics,
};
