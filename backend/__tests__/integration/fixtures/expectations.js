const { EXPECTED_EMBEDDING_DIMENSIONS } = require('../../fixtures/drugs');

const SEARCH_QUERIES = {
  vectorDiabetes: 'diabetes medication',
  fulltextMetformin: 'metformin',
  fulltextLipitor: 'Lipitor',
  hybridHeart: 'heart medication',
};

/** Metformin seed template uses Biguanides (not a generic "Diabetes" class). */
const SEEDED_THERAPEUTIC_CLASS = 'Biguanides';

const REQUIRED_DRUG_FIELDS = [
  'drug_name',
  'generic_name',
  'description',
  'therapeutic_class',
  'formulary_tier',
  'average_cost',
];

function isDiabetesRelated(drug) {
  const classMatch = /diabetes/i.test(drug.therapeutic_class || '');
  const keywordMatch = (drug.keywords || []).some((k) => /diabetes/i.test(k));
  const nameMatch = /diabetes|metformin|glipizide|insulin/i.test(
    `${drug.drug_name} ${drug.generic_name}`
  );
  return classMatch || keywordMatch || nameMatch;
}

function resultMatchesDrugName(drug, namePattern) {
  const pattern = new RegExp(namePattern, 'i');
  return (
    pattern.test(drug.drug_name || '') ||
    pattern.test(drug.generic_name || '') ||
    (drug.brand_names || []).some((brand) => pattern.test(brand))
  );
}

function assertSearchEnvelope(body, searchType, query) {
  expect(body.success).toBe(true);
  expect(body.searchType).toBe(searchType);
  expect(body.query).toBe(query);
  expect(typeof body.searchTimeMs).toBe('number');
  expect(body.searchTimeMs).toBeGreaterThanOrEqual(0);
  expect(body.count).toBe(body.results.length);
  expect(Array.isArray(body.results)).toBe(true);
}

module.exports = {
  EXPECTED_EMBEDDING_DIMENSIONS,
  SEARCH_QUERIES,
  SEEDED_THERAPEUTIC_CLASS,
  REQUIRED_DRUG_FIELDS,
  isDiabetesRelated,
  resultMatchesDrugName,
  assertSearchEnvelope,
};
