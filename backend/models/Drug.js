const mongoose = require('mongoose');
require('dotenv').config();

const DrugSchema = new mongoose.Schema({
  drug_name: {
    type: String,
    required: true,
    index: true
  },
  generic_name: {
    type: String,
    required: true,
    index: true
  },
  brand_names: [{
    type: String
  }],
  description: {
    type: String,
    required: true
  },
  description_embedding: {
    type: [Number],
    required: true
  },
  therapeutic_class: {
    type: String,
    required: true,
    index: true
  },
  formulary_tier: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  average_cost: {
    type: Number,
    required: true,
    min: 0
  },
  common_dosages: [{
    type: String
  }],
  interactions: [{
    type: String
  }],
  side_effects: [{
    type: String
  }],
  alternatives: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drug'
  }],
  keywords: [{
    type: String
  }]
}, {
  timestamps: true,
  collection: process.env.COLLECTION_NAME || 'drugs'  // Use collection name from environment
});

// Compound index for common queries
DrugSchema.index({ formulary_tier: 1, average_cost: 1 });
DrugSchema.index({ therapeutic_class: 1, formulary_tier: 1 });

module.exports = mongoose.model('Drug', DrugSchema);

