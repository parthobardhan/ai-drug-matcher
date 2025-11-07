const express = require('express');
const router = express.Router();
const Drug = require('../models/Drug');

/**
 * @route   GET /api/diagnostics/embeddings
 * @desc    Check embedding dimensions in database
 */
router.get('/embeddings', async (req, res) => {
  try {
    // Get a sample drug
    const sampleDrug = await Drug.findOne();
    
    if (!sampleDrug) {
      return res.json({
        success: false,
        message: 'No drugs found in database',
        embeddingDimensions: 0
      });
    }
    
    const embeddingDimensions = sampleDrug.description_embedding?.length || 0;
    
    // Get total count
    const totalDrugs = await Drug.countDocuments();
    
    res.json({
      success: true,
      totalDrugs,
      sampleDrug: {
        name: sampleDrug.drug_name,
        embeddingDimensions
      },
      embeddingDimensions,
      expectedDimensions: 512,
      dimensionsMatch: embeddingDimensions === 512,
      recommendation: embeddingDimensions !== 512 
        ? `Database embeddings are ${embeddingDimensions} dimensions. Either re-seed database (npm run seed) or update vector index to use ${embeddingDimensions} dimensions.`
        : 'Embedding dimensions are correct'
    });
  } catch (error) {
    console.error('Diagnostics error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to check embeddings', 
      message: error.message 
    });
  }
});

module.exports = router;


