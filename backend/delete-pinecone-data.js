// delete-pinecone-data.js
// Script to delete all data from the Pinecone website-index

require('dotenv').config();
const { Pinecone } = require("@pinecone-database/pinecone");

async function deleteAllPineconeData() {
  try {
    // Validate environment variables
    if (!process.env.PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY not found in environment variables");
    }

    if (!process.env.PINECONE_INDEX) {
      throw new Error("PINECONE_INDEX not found in environment variables");
    }

    console.log(`🔑 Connecting to Pinecone...`);
    console.log(`📋 Index: ${process.env.PINECONE_INDEX}`);

    // Initialize Pinecone client
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pc.index(process.env.PINECONE_INDEX);

    // Get index stats before deletion
    console.log(`📊 Getting index stats before deletion...`);
    const statsBefore = await index.describeIndexStats();
    console.log(`📈 Current vector count: ${statsBefore.totalVectorCount || 0}`);
    console.log(`💾 Index dimension: ${statsBefore.dimension || 'Unknown'}`);
    
    if (statsBefore.totalVectorCount === 0) {
      console.log(`✅ Index is already empty. Nothing to delete.`);
      return;
    }

    // Confirm deletion (you can comment this out for automated scripts)
    console.log(`\n⚠️  WARNING: This will delete ALL data from the index "${process.env.PINECONE_INDEX}"`);
    console.log(`⚠️  This action cannot be undone!`);
    
    // For safety, uncomment the next few lines if you want manual confirmation
    /*
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise((resolve) => {
      rl.question('Do you want to proceed? (yes/no): ', resolve);
    });
    rl.close();
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled.');
      return;
    }
    */

    console.log(`🗑️  Starting deletion of all vectors...`);
    
    // Delete all vectors in the index
    await index.deleteAll();
    
    console.log(`✅ Delete operation completed!`);
    
    // Wait a moment for the deletion to propagate
    console.log(`⏳ Waiting for deletion to propagate...`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Get index stats after deletion
    console.log(`📊 Getting index stats after deletion...`);
    const statsAfter = await index.describeIndexStats();
    console.log(`📈 Final vector count: ${statsAfter.totalVectorCount || 0}`);
    
    if (statsAfter.totalVectorCount === 0) {
      console.log(`🎉 All data successfully deleted from index "${process.env.PINECONE_INDEX}"`);
    } else {
      console.log(`⚠️  Some vectors may still be present (${statsAfter.totalVectorCount}). This might be due to propagation delay.`);
      console.log(`💡 Try running the script again in a few minutes if vectors are still present.`);
    }

  } catch (error) {
    console.error(`❌ Error deleting Pinecone data:`, error.message);
    
    if (error.message?.includes('API key')) {
      console.error(`💡 Check your PINECONE_API_KEY in the .env file`);
    } else if (error.message?.includes('index')) {
      console.error(`💡 Check your PINECONE_INDEX name in the .env file`);
      console.error(`💡 Make sure the index "${process.env.PINECONE_INDEX}" exists in your Pinecone project`);
    } else if (error.message?.includes('not found')) {
      console.error(`💡 The index "${process.env.PINECONE_INDEX}" might not exist or you don't have access to it`);
    }
    
    process.exit(1);
  }
}

// Alternative function to delete by namespace (if you use namespaces)
async function deleteByNamespace(namespace) {
  try {
    console.log(`🔑 Connecting to Pinecone...`);
    
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pc.index(process.env.PINECONE_INDEX);
    
    console.log(`🗑️  Deleting all vectors in namespace: "${namespace}"`);
    await index.deleteAll(namespace);
    
    console.log(`✅ All vectors in namespace "${namespace}" deleted successfully!`);
    
  } catch (error) {
    console.error(`❌ Error deleting namespace data:`, error.message);
    process.exit(1);
  }
}

// Run the deletion
if (require.main === module) {
  // Check if namespace argument is provided
  const namespace = process.argv[2];
  
  if (namespace) {
    console.log(`🎯 Deleting data from namespace: "${namespace}"`);
    deleteByNamespace(namespace);
  } else {
    console.log(`🎯 Deleting ALL data from the entire index`);
    deleteAllPineconeData();
  }
}

module.exports = { deleteAllPineconeData, deleteByNamespace };
