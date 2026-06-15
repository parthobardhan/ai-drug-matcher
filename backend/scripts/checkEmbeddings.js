const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Drug = require('../models/Drug');

/**
 * Check embedding dimensions in the database
 */
async function checkEmbeddings() {
  console.log('\n🔍 Checking Embedding Dimensions in Database');
  console.log('═══════════════════════════════════════════════\n');
  
  try {
    // Connect to database
    await connectDB();
    
    // Get a sample of drugs
    const sampleDrugs = await Drug.find().limit(5);
    
    if (sampleDrugs.length === 0) {
      console.log('❌ No drugs found in database');
      process.exit(1);
    }
    
    console.log(`📊 Checking ${sampleDrugs.length} sample drugs:\n`);
    
    let allSameDimension = true;
    let firstDimension = null;
    
    sampleDrugs.forEach((drug, index) => {
      const embeddingDimensions = drug.description_embedding?.length || 0;
      
      if (index === 0) {
        firstDimension = embeddingDimensions;
      } else if (embeddingDimensions !== firstDimension) {
        allSameDimension = false;
      }
      
      console.log(`${index + 1}. ${drug.drug_name}`);
      console.log(`   Embedding Dimensions: ${embeddingDimensions}`);
      console.log('');
    });
    
    console.log('═══════════════════════════════════════════════\n');
    
    if (allSameDimension) {
      console.log(`✅ All embeddings have ${firstDimension} dimensions\n`);
      
      if (firstDimension === 512) {
        console.log('✅ Embeddings match expected dimension (512)');
        console.log('✅ This is correct for the current configuration\n');
      } else if (firstDimension === 1024) {
        console.log('❌ ISSUE FOUND: Embeddings are 1024 dimensions');
        console.log('   Current configuration expects 512 dimensions');
        console.log('   Vector index might be configured for 1024 dimensions\n');
        console.log('🔧 Solutions:');
        console.log('   Option 1: Re-seed database with new embeddings');
        console.log('             Run: npm run seed');
        console.log('   Option 2: Update vector index to use 1024 dimensions');
        console.log('             In MongoDB Atlas Search Indexes\n');
      } else {
        console.log(`⚠️  Unexpected dimension: ${firstDimension}`);
        console.log(`   Expected: 512 or 1024\n`);
      }
    } else {
      console.log('❌ WARNING: Inconsistent embedding dimensions found');
      console.log('   Re-seed the database to fix: npm run seed\n');
    }
    
    console.log('═══════════════════════════════════════════════\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error checking embeddings:', error.message);
    process.exit(1);
  }
}

checkEmbeddings();



