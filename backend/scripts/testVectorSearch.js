const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';
const TEST_QUERY = 'Diabetes medication';

/**
 * Check API health
 */
async function checkHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.error('❌ Server is not responding');
    return false;
  }
}

/**
 * Check database statistics
 */
async function checkDatabaseStats() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/drugs/stats/overview`);
    console.log(`✅ Database has ${response.data.stats.totalDrugs} drugs`);
    return response.data.stats.totalDrugs > 0;
  } catch (error) {
    console.log('⚠️  Could not retrieve database stats');
    return false;
  }
}

/**
 * Check embedding dimensions
 */
async function checkEmbeddings() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/diagnostics/embeddings`);
    const dimensions = response.data.embeddingDimensions;
    const expected = response.data.expectedDimensions;
    
    if (response.data.dimensionsMatch) {
      console.log(`✅ Embeddings: ${dimensions} dimensions (correct)`);
    } else {
      console.log(`⚠️  Embeddings: ${dimensions} dimensions (expected: ${expected})`);
      console.log(`   ${response.data.recommendation}`);
    }
    return response.data.dimensionsMatch;
  } catch (error) {
    console.log('⚠️  Could not check embedding dimensions (restart server to enable diagnostics)');
    return true; // Don't fail if diagnostics unavailable
  }
}

/**
 * Test vector search functionality
 */
async function testVectorSearch() {
  console.log('\n🧪 Testing Vector Search API');
  console.log('═══════════════════════════════════════════════\n');
  
  // Check server health
  const isHealthy = await checkHealth();
  if (!isHealthy) {
    console.error('Server is not running. Please start with: npm run dev');
    process.exit(1);
  }
  
  // Check database
  console.log('');
  const hasData = await checkDatabaseStats();
  if (!hasData) {
    console.log('\n⚠️  Database appears to be empty. Run: npm run seed\n');
  }
  
  // Check embeddings
  const embeddingsOk = await checkEmbeddings();
  
  console.log('');
  
  try {
    console.log(`📝 Query: "${TEST_QUERY}"`);
    console.log(`🔗 API Endpoint: ${API_BASE_URL}/api/drugs/search/vector\n`);
    
    const startTime = Date.now();
    
    const response = await axios.get(`${API_BASE_URL}/api/drugs/search/vector`, {
      params: {
        query: TEST_QUERY,
        limit: 5
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('✅ SUCCESS - Vector Search API Response:');
    console.log('═══════════════════════════════════════════════\n');
    
    console.log(`⏱️  Response Time: ${responseTime}ms`);
    console.log(`📊 Results Count: ${response.data.count}`);
    console.log(`🔍 Search Type: ${response.data.searchType}`);
    console.log(`🎯 Query: ${response.data.query}\n`);
    
    if (response.data.results && response.data.results.length > 0) {
      console.log('📋 Top Results:\n');
      response.data.results.forEach((drug, index) => {
        console.log(`${index + 1}. ${drug.drug_name} (${drug.generic_name})`);
        console.log(`   Score: ${drug.score?.toFixed(4) || 'N/A'}`);
        console.log(`   Class: ${drug.therapeutic_class}`);
        console.log(`   Tier: ${drug.formulary_tier} | Cost: $${drug.average_cost}`);
        console.log(`   Description: ${drug.description.substring(0, 100)}...`);
        console.log('');
      });
      
      console.log('═══════════════════════════════════════════════');
      console.log('✅ TEST PASSED: Vector search returned results');
      console.log('═══════════════════════════════════════════════\n');
      
      process.exit(0);
    } else {
      console.log('⚠️  WARNING: No results returned');
      console.log('This might indicate:');
      console.log('  - Database is empty (run: npm run seed)');
      console.log('  - Vector index not created in MongoDB Atlas');
      console.log('  - Embedding generation issue\n');
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED - Error details:');
    console.error('═══════════════════════════════════════════════\n');
    
    if (error.response) {
      console.error('API Error Response:');
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Message: ${error.response.data.message || error.response.data.error}`);
      console.error(`  Full Response:`, JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('Network Error:');
      console.error('  No response received from server');
      console.error('  Make sure the server is running: npm run dev');
    } else {
      console.error('Error:', error.message);
    }
    
    console.error('\n═══════════════════════════════════════════════');
    console.error('Troubleshooting steps:');
    console.error('  1. Ensure server is running: npm run dev');
    console.error('  2. Check .env file has correct VOYAGEAI_API_KEY');
    console.error('  3. Verify database has been seeded: npm run seed');
    console.error('  4. Confirm vector index exists in MongoDB Atlas');
    console.error('═══════════════════════════════════════════════\n');
    
    process.exit(1);
  }
}

// Run the test
console.log('\n🚀 Starting Vector Search Test...');
testVectorSearch();

