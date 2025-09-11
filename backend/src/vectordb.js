// src/vectordb.js
require('dotenv').config();
const { Pinecone } = require("@pinecone-database/pinecone");

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pc.index(process.env.PINECONE_INDEX);

async function upsertVectors(vectors) {
  try {
    // Validation
    if (!vectors || !Array.isArray(vectors)) {
      return { success: false, error: "Invalid input: vectors must be an array" };
    }

    if (vectors.length === 0) {
      return { success: false, error: "No vectors provided for upsert" };
    }

    // Validate vector structure
    for (let i = 0; i < vectors.length; i++) {
      const vector = vectors[i];
      if (!vector.id || !vector.values || !Array.isArray(vector.values)) {
        return { 
          success: false, 
          error: `Invalid vector at index ${i}: must have id and values array` 
        };
      }
    }

    if (!process.env.PINECONE_API_KEY) {
      return { success: false, error: "Pinecone API key not configured" };
    }

    if (!process.env.PINECONE_INDEX) {
      return { success: false, error: "Pinecone index name not configured" };
    }

    // Perform upsert
    await index.upsert(vectors);
    return { success: true, upserted: vectors.length };

  } catch (error) {
    console.error("Vector upsert error:", error.message);
    
    if (error.message?.includes('API key')) {
      return { success: false, error: "Invalid Pinecone API key" };
    } else if (error.message?.includes('index')) {
      return { success: false, error: "Pinecone index not found or invalid" };
    } else if (error.message?.includes('dimension')) {
      return { success: false, error: "Vector dimension mismatch with index" };
    } else if (error.message?.includes('quota')) {
      return { success: false, error: "Pinecone quota exceeded" };
    } else {
      return { success: false, error: `Vector upsert failed: ${error.message}` };
    }
  }
}

async function queryVector(vector, topK = 5, filter = {}) {
  try {
    // Validation
    if (!vector || !Array.isArray(vector)) {
      return { success: false, error: "Invalid input: vector must be an array" };
    }

    if (vector.length === 0) {
      return { success: false, error: "Query vector cannot be empty" };
    }

    if (topK <= 0 || topK > 10000) {
      return { success: false, error: "topK must be between 1 and 10000" };
    }

    if (!process.env.PINECONE_API_KEY) {
      return { success: false, error: "Pinecone API key not configured" };
    }

    const q = await index.query({
      vector,
      topK,
      includeMetadata: true,
      filter
    });

    return { success: true, matches: q.matches || [] };

  } catch (error) {
    console.error("Vector query error:", error.message);
    
    if (error.message?.includes('API key')) {
      return { success: false, error: "Invalid Pinecone API key" };
    } else if (error.message?.includes('index')) {
      return { success: false, error: "Pinecone index not found or invalid" };
    } else if (error.message?.includes('dimension')) {
      return { success: false, error: "Query vector dimension mismatch with index" };
    } else {
      return { success: false, error: `Vector query failed: ${error.message}` };
    }
  }
}

module.exports = { upsertVectors, queryVector };
