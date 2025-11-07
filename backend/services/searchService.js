const Drug = require('../models/Drug');
const { generateEmbedding } = require('./embeddingService');

/**
 * Perform vector search on drug descriptions
 * @param {string} query - Search query
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} - Array of search results
 */
async function vectorSearch(query, limit = 10) {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Debug: Log embedding dimensions
    console.log(`✓ Generated query embedding with ${queryEmbedding.length} dimensions`);

    // Perform vector search using MongoDB Atlas Vector Search
    const results = await Drug.aggregate([
      {
        $vectorSearch: {
          index: 'drug_vector_index',
          path: 'description_embedding',
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: limit
        }
      },
      {
        $project: {
          drug_name: 1,
          generic_name: 1,
          brand_names: 1,
          description: 1,
          therapeutic_class: 1,
          formulary_tier: 1,
          average_cost: 1,
          common_dosages: 1,
          side_effects: 1,
          interactions: 1,
          keywords: 1,
          alternatives: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ]);

    return results;
  } catch (error) {
    console.error('Vector search error:', error);
    throw error;
  }
}

/**
 * Perform full-text search on drug names and keywords
 * @param {string} query - Search query
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} - Array of search results
 */
async function fullTextSearch(query, limit = 10) {
  try {
    // Perform full-text search using MongoDB Atlas Search
    const results = await Drug.aggregate([
      {
        $search: {
          index: 'drug_text_index',
          text: {
            query: query,
            path: ['drug_name', 'generic_name', 'brand_names', 'keywords'],
            fuzzy: {
              maxEdits: 2,
              prefixLength: 2
            }
          }
        }
      },
      {
        $limit: limit
      },
      {
        $project: {
          drug_name: 1,
          generic_name: 1,
          brand_names: 1,
          description: 1,
          therapeutic_class: 1,
          formulary_tier: 1,
          average_cost: 1,
          common_dosages: 1,
          side_effects: 1,
          interactions: 1,
          keywords: 1,
          alternatives: 1,
          score: { $meta: 'searchScore' }
        }
      }
    ]);

    return results;
  } catch (error) {
    console.error('Full-text search error:', error);
    throw error;
  }
}

/**
 * Perform hybrid search combining vector and full-text search
 * Uses MongoDB's native $rankFusion operator
 * @param {string} query - Search query
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} - Array of search results
 */
async function hybridSearch(query, limit = 10) {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Debug: Log embedding dimensions
    console.log(`✓ Generated query embedding with ${queryEmbedding.length} dimensions for hybrid search`);

    // Perform hybrid search using $rankFusion
    const results = await Drug.aggregate([
      {
        $rankFusion: {
          input: {
            pipelines: {
              // Vector search pipeline - only selection stages allowed
              vectorSearch: [
                {
                  $vectorSearch: {
                    index: 'drug_vector_index',
                    path: 'description_embedding',
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: 20
                  }
                }
              ],
              // Full-text search pipeline - only selection stages allowed
              fullTextSearch: [
                {
                  $search: {
                    index: 'drug_text_index',
                    text: {
                      query: query,
                      path: ['drug_name', 'generic_name', 'brand_names', 'keywords'],
                      fuzzy: {
                        maxEdits: 2
                      }
                    }
                  }
                },
                {
                  $limit: 20
                }
              ]
            }
          }
        }
      },
      {
        $limit: limit
      },
      {
        $project: {
          drug_name: 1,
          generic_name: 1,
          brand_names: 1,
          description: 1,
          therapeutic_class: 1,
          formulary_tier: 1,
          average_cost: 1,
          common_dosages: 1,
          side_effects: 1,
          interactions: 1,
          keywords: 1,
          alternatives: 1,
          score: { $meta: 'searchScore' }
        }
      }
    ]);

    return results;
  } catch (error) {
    console.error('Hybrid search error:', error);
    throw error;
  }
}

/**
 * Get drug alternatives by ID
 * @param {string} drugId - Drug ID
 * @returns {Promise<Array>} - Array of alternative drugs
 */
async function getAlternatives(drugId) {
  try {
    const drug = await Drug.findById(drugId).populate('alternatives');
    return drug ? drug.alternatives : [];
  } catch (error) {
    console.error('Error getting alternatives:', error);
    throw error;
  }
}

/**
 * Get drugs by therapeutic class
 * @param {string} therapeuticClass - Therapeutic class
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} - Array of drugs
 */
async function getByTherapeuticClass(therapeuticClass, limit = 20) {
  try {
    const drugs = await Drug.find({ therapeutic_class: therapeuticClass })
      .limit(limit)
      .sort({ average_cost: 1 });
    return drugs;
  } catch (error) {
    console.error('Error getting drugs by therapeutic class:', error);
    throw error;
  }
}

/**
 * Get drugs by formulary tier
 * @param {number} tier - Formulary tier (1-5)
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} - Array of drugs
 */
async function getByFormularyTier(tier, limit = 20) {
  try {
    const drugs = await Drug.find({ formulary_tier: tier })
      .limit(limit)
      .sort({ average_cost: 1 });
    return drugs;
  } catch (error) {
    console.error('Error getting drugs by formulary tier:', error);
    throw error;
  }
}

/**
 * Get drug statistics
 * @returns {Promise<Object>} - Drug statistics
 */
async function getStatistics() {
  try {
    const totalDrugs = await Drug.countDocuments();
    const therapeuticClasses = await Drug.distinct('therapeutic_class');
    const avgCostByTier = await Drug.aggregate([
      {
        $group: {
          _id: '$formulary_tier',
          avgCost: { $avg: '$average_cost' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      totalDrugs,
      therapeuticClassesCount: therapeuticClasses.length,
      therapeuticClasses,
      avgCostByTier
    };
  } catch (error) {
    console.error('Error getting statistics:', error);
    throw error;
  }
}

module.exports = {
  vectorSearch,
  fullTextSearch,
  hybridSearch,
  getAlternatives,
  getByTherapeuticClass,
  getByFormularyTier,
  getStatistics
};

