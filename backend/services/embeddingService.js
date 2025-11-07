const axios = require('axios');
require('dotenv').config();

const VOYAGEAI_API_KEY = process.env.VOYAGEAI_API_KEY;
const VOYAGEAI_API_URL = 'https://api.voyageai.com/v1/embeddings';
const MODEL_NAME = 'voyage-3.5-lite'; // Cheapest model, 512 dimensions
const OUTPUT_DIMENSION = 512; // Explicitly set to 512 dimensions to match MongoDB index

/**
 * Generate embeddings for a single text using VoyageAI
 * @param {string} text - The text to generate embeddings for
 * @returns {Promise<number[]>} - Array of embedding values
 */
async function generateEmbedding(text) {
  try {
    const response = await axios.post(
      VOYAGEAI_API_URL,
      {
        input: text,
        model: MODEL_NAME,
        output_dimension: OUTPUT_DIMENSION
      },
      {
        headers: {
          'Authorization': `Bearer ${VOYAGEAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.data && response.data.data[0]) {
      const embedding = response.data.data[0].embedding;
      console.log(`✓ VoyageAI returned embedding with ${embedding.length} dimensions (requested: ${OUTPUT_DIMENSION})`);
      return embedding;
    } else {
      throw new Error('Invalid response from VoyageAI API');
    }
  } catch (error) {
    console.error('Error generating embedding:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param {string[]} texts - Array of texts to generate embeddings for
 * @returns {Promise<number[][]>} - Array of embedding arrays
 */
async function generateEmbeddingsBatch(texts) {
  try {
    // VoyageAI supports batch processing
    const response = await axios.post(
      VOYAGEAI_API_URL,
      {
        input: texts,
        model: MODEL_NAME,
        output_dimension: OUTPUT_DIMENSION
      },
      {
        headers: {
          'Authorization': `Bearer ${VOYAGEAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.data) {
      return response.data.data.map(item => item.embedding);
    } else {
      throw new Error('Invalid response from VoyageAI API');
    }
  } catch (error) {
    console.error('Error generating batch embeddings:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Process texts in chunks to avoid API limits
 * @param {string[]} texts - Array of texts
 * @param {number} chunkSize - Number of texts per batch (default: 128)
 * @returns {Promise<number[][]>} - Array of embedding arrays
 */
async function generateEmbeddingsBatchChunked(texts, chunkSize = 128) {
  const embeddings = [];
  const totalChunks = Math.ceil(texts.length / chunkSize);

  console.log(`Processing ${texts.length} texts in ${totalChunks} chunks...`);

  for (let i = 0; i < texts.length; i += chunkSize) {
    const chunk = texts.slice(i, i + chunkSize);
    const chunkNum = Math.floor(i / chunkSize) + 1;
    
    console.log(`Processing chunk ${chunkNum}/${totalChunks} (${chunk.length} items)...`);
    
    try {
      const chunkEmbeddings = await generateEmbeddingsBatch(chunk);
      embeddings.push(...chunkEmbeddings);
      
      // Small delay to avoid rate limiting
      if (i + chunkSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Error processing chunk ${chunkNum}:`, error.message);
      throw error;
    }
  }

  console.log(`✓ Successfully generated ${embeddings.length} embeddings`);
  return embeddings;
}

/**
 * Prepare text for embedding by combining relevant fields
 * @param {Object} drug - Drug object
 * @returns {string} - Combined text for embedding
 */
function prepareDrugTextForEmbedding(drug) {
  const parts = [
    drug.description,
    `Therapeutic class: ${drug.therapeutic_class}`,
    `Used for: ${drug.keywords.join(', ')}`
  ];
  return parts.join('. ');
}

module.exports = {
  generateEmbedding,
  generateEmbeddingsBatch,
  generateEmbeddingsBatchChunked,
  prepareDrugTextForEmbedding,
  MODEL_NAME
};

