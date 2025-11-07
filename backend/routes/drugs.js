const express = require('express');
const router = express.Router();
const Drug = require('../models/Drug');
const {
  vectorSearch,
  fullTextSearch,
  hybridSearch,
  getAlternatives,
  getByTherapeuticClass,
  getByFormularyTier,
  getStatistics
} = require('../services/searchService');

/**
 * @route   GET /api/drugs/search/vector
 * @desc    Perform vector (semantic) search
 * @query   query - Search query string
 * @query   limit - Number of results (default: 10)
 */
router.get('/search/vector', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const startTime = Date.now();
    const results = await vectorSearch(query, parseInt(limit));
    const searchTime = Date.now() - startTime;

    res.json({
      success: true,
      searchType: 'vector',
      query,
      results,
      count: results.length,
      searchTimeMs: searchTime
    });
  } catch (error) {
    console.error('Vector search error:', error);
    res.status(500).json({ 
      error: 'Vector search failed', 
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/drugs/search/fulltext
 * @desc    Perform full-text search
 * @query   query - Search query string
 * @query   limit - Number of results (default: 10)
 */
router.get('/search/fulltext', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const startTime = Date.now();
    const results = await fullTextSearch(query, parseInt(limit));
    const searchTime = Date.now() - startTime;

    res.json({
      success: true,
      searchType: 'fulltext',
      query,
      results,
      count: results.length,
      searchTimeMs: searchTime
    });
  } catch (error) {
    console.error('Full-text search error:', error);
    res.status(500).json({ 
      error: 'Full-text search failed', 
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/drugs/search/hybrid
 * @desc    Perform hybrid search (vector + full-text)
 * @query   query - Search query string
 * @query   limit - Number of results (default: 10)
 */
router.get('/search/hybrid', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const startTime = Date.now();
    const results = await hybridSearch(query, parseInt(limit));
    const searchTime = Date.now() - startTime;

    res.json({
      success: true,
      searchType: 'hybrid',
      query,
      results,
      count: results.length,
      searchTimeMs: searchTime
    });
  } catch (error) {
    console.error('Hybrid search error:', error);
    res.status(500).json({ 
      error: 'Hybrid search failed', 
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/drugs/:id
 * @desc    Get drug by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const drug = await Drug.findById(req.params.id).populate('alternatives');
    
    if (!drug) {
      return res.status(404).json({ error: 'Drug not found' });
    }

    res.json({
      success: true,
      drug
    });
  } catch (error) {
    console.error('Get drug error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch drug', 
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/drugs/:id/alternatives
 * @desc    Get drug alternatives by ID
 */
router.get('/:id/alternatives', async (req, res) => {
  try {
    const alternatives = await getAlternatives(req.params.id);
    
    res.json({
      success: true,
      alternatives,
      count: alternatives.length
    });
  } catch (error) {
    console.error('Get alternatives error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch alternatives', 
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/drugs/class/:therapeuticClass
 * @desc    Get drugs by therapeutic class
 */
router.get('/class/:therapeuticClass', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const drugs = await getByTherapeuticClass(
      req.params.therapeuticClass, 
      parseInt(limit)
    );
    
    res.json({
      success: true,
      therapeuticClass: req.params.therapeuticClass,
      drugs,
      count: drugs.length
    });
  } catch (error) {
    console.error('Get by therapeutic class error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch drugs', 
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/drugs/tier/:tier
 * @desc    Get drugs by formulary tier
 */
router.get('/tier/:tier', async (req, res) => {
  try {
    const tier = parseInt(req.params.tier);
    const { limit = 20 } = req.query;

    if (tier < 1 || tier > 5) {
      return res.status(400).json({ error: 'Tier must be between 1 and 5' });
    }
    
    const drugs = await getByFormularyTier(tier, parseInt(limit));
    
    res.json({
      success: true,
      formularyTier: tier,
      drugs,
      count: drugs.length
    });
  } catch (error) {
    console.error('Get by formulary tier error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch drugs', 
      message: error.message 
    });
  }
});

/**
 * @route   GET /api/drugs/stats
 * @desc    Get drug statistics
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await getStatistics();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics', 
      message: error.message 
    });
  }
});

module.exports = router;


