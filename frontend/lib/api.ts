const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Drug {
  _id: string;
  drug_name: string;
  generic_name: string;
  brand_names: string[];
  description: string;
  therapeutic_class: string;
  formulary_tier: number;
  average_cost: number;
  common_dosages: string[];
  side_effects: string[];
  interactions: string[];
  keywords: string[];
  alternatives?: string[];
  score?: number;
}

export interface SearchResponse {
  success: boolean;
  searchType: string;
  query: string;
  results: Drug[];
  count: number;
  searchTimeMs: number;
}

export interface DrugDetailResponse {
  success: boolean;
  drug: Drug;
}

export interface AlternativesResponse {
  success: boolean;
  alternatives: Drug[];
  count: number;
}

export interface StatsResponse {
  success: boolean;
  stats: {
    totalDrugs: number;
    therapeuticClassesCount: number;
    therapeuticClasses: string[];
    avgCostByTier: Array<{
      _id: number;
      avgCost: number;
      count: number;
    }>;
  };
}

/**
 * Perform vector search
 */
export async function vectorSearch(query: string, limit: number = 10): Promise<SearchResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/drugs/search/vector?query=${encodeURIComponent(query)}&limit=${limit}`
  );
  
  if (!response.ok) {
    throw new Error('Vector search failed');
  }
  
  return response.json();
}

/**
 * Perform full-text search
 */
export async function fullTextSearch(query: string, limit: number = 10): Promise<SearchResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/drugs/search/fulltext?query=${encodeURIComponent(query)}&limit=${limit}`
  );
  
  if (!response.ok) {
    throw new Error('Full-text search failed');
  }
  
  return response.json();
}

/**
 * Perform hybrid search
 */
export async function hybridSearch(query: string, limit: number = 10): Promise<SearchResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/drugs/search/hybrid?query=${encodeURIComponent(query)}&limit=${limit}`
  );
  
  if (!response.ok) {
    throw new Error('Hybrid search failed');
  }
  
  return response.json();
}

/**
 * Get drug by ID
 */
export async function getDrugById(id: string): Promise<DrugDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/api/drugs/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch drug');
  }
  
  return response.json();
}

/**
 * Get drug alternatives
 */
export async function getDrugAlternatives(id: string): Promise<AlternativesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/drugs/${id}/alternatives`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch alternatives');
  }
  
  return response.json();
}

/**
 * Get statistics
 */
export async function getStatistics(): Promise<StatsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/drugs/stats/overview`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }
  
  return response.json();
}

/**
 * Health check
 */
export async function healthCheck(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/health`);
  
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  
  return response.json();
}


