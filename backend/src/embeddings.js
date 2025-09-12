// src/embeddings.js
require('dotenv').config();
const axios = require("axios");

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const BASE = "https://generativelanguage.googleapis.com/v1beta";

async function createEmbedding(text) {
  try {
    // Validation
    if (!text || typeof text !== 'string') {
      return { success: false, error: "Invalid input: text must be a non-empty string" };
    }

    if (!GEMINI_KEY) {
      return { success: false, error: "Gemini API key not configured" };
    }

    // Correct Gemini API embedding endpoint
    const model = "models/text-embedding-004";
    const url = `${BASE}/${model}:embedContent?key=${GEMINI_KEY}`;

    const res = await axios.post(url, { 
      content: { parts: [{ text }] },
      taskType: "RETRIEVAL_DOCUMENT"
    }, {
      headers: { 
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    // Handle Gemini embedding response format
    if (res.data?.embedding?.values) {
      return { success: true, embedding: res.data.embedding.values };
    }
    
    console.log("Full API response:", JSON.stringify(res.data, null, 2));

    return { 
      success: false, 
      error: "Unexpected embedding response format",
      details: "API returned data but not in expected format"
    };

  } catch (error) {
    console.error("Embedding creation error:", error.message);
    
    if (error.response) {
      // API error response
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.response.statusText;
      
      if (status === 401) {
        return { success: false, error: "Invalid Gemini API key" };
      } else if (status === 429) {
        return { success: false, error: "Rate limit exceeded, please try again later" };
      } else if (status === 400) {
        return { success: false, error: `Invalid request: ${message}` };
      } else {
        return { success: false, error: `API error (${status}): ${message}` };
      }
    } else if (error.code === 'ECONNREFUSED') {
      return { success: false, error: "Cannot connect to Gemini API" };
    } else if (error.code === 'ENOTFOUND') {
      return { success: false, error: "Gemini API endpoint not found" };
    } else if (error.code === 'ETIMEDOUT') {
      return { success: false, error: "Request to Gemini API timed out" };
    } else {
      return { success: false, error: `Embedding creation failed: ${error.message}` };
    }
  }
}

module.exports = { createEmbedding };
