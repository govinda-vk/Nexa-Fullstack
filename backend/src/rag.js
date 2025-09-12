// src/rag.js
require('dotenv').config();
const { createEmbedding } = require("./embeddings.js");
const { queryVector } = require("./vectordb.js");
const axios = require("axios");

async function answerQuestion({ question, userEmail, website, topK = 20 }) {
  try {
    // Input validation
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return { 
        success: false, 
        error: "Invalid question: must be a non-empty string" 
      };
    }

    if (topK <= 0 || topK > 50) {
      return { 
        success: false, 
        error: "topK must be between 1 and 50" 
      };
    }

    // Create embedding for the question
    const embeddingResult = await createEmbedding(question);
    if (!embeddingResult.success) {
      return { 
        success: false, 
        error: "Failed to create question embedding", 
        details: embeddingResult.error 
      };
    }

    // Build filter for querying - include userEmail for data isolation and optionally website
    const filter = {};
    if (userEmail) filter.userEmail = userEmail;
    if (website) {
      // Normalize website input - extract domain from URL if full URL is provided
      let websiteDomain = website;
      try {
        // If it looks like a URL, extract just the hostname
        if (website.includes('http://') || website.includes('https://') || website.includes('://')) {
          websiteDomain = new URL(website).hostname;
        }
        // Remove any trailing slashes
        websiteDomain = websiteDomain.replace(/\/$/, '');
      } catch (e) {
        // If URL parsing fails, use the original string
        websiteDomain = website.replace(/^https?:\/\//, '').replace(/\/$/, '');
      }
      filter.website = websiteDomain;
    }
    
    const queryResult = await queryVector(embeddingResult.embedding, topK, filter);
    
    if (!queryResult.success) {
      return { 
        success: false, 
        error: "Failed to query vector database", 
        details: queryResult.error 
      };
    }

    const hits = queryResult.matches;

    if (!hits || hits.length === 0) {
      const noDataMessage = website 
        ? `I don't have information to answer that question based on content from ${filter.website}.`
        : "I don't have information to answer that question based on your indexed websites.";
      
      return { 
        success: true,
        answer: noDataMessage, 
        hits: [],
        sources: [],
        websiteFilter: filter.website || null
      };
    }

    // Build context from search results
    const context = hits.map(h => 
      `Website: ${h.metadata?.website || 'Unknown'}\nURL: ${h.metadata?.url || 'Unknown'}\n${h.metadata?.textPreview || 'No preview available'}`
    ).join("\n\n---\n\n");

    const sources = [...new Set(hits.map(h => h.metadata?.url).filter(Boolean))];
    const websites = [...new Set(hits.map(h => h.metadata?.website).filter(Boolean))];

    const websiteContext = website ? ` (filtered to ${website})` : ` (from ${websites.length} website${websites.length !== 1 ? 's' : ''}: ${websites.join(', ')})`;
    
    const prompt = `You are Askit, a friendly and expert virtual assistant for ${website || 'this website'}. 
- Answer based *only* on the context below.
- Be concise for simple questions, and detailed (2-4 sentences) for complex ones.
- If the answer isn't in the context, say "I can't find details on that, but I can help with other topics from the website." Do not say "I don't know."

Context from ${websiteContext}:
---
${context}
---

Question: ${question}

Answer:`;

    // Call Gemini generateContent API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
    
    const response = await axios.post(url, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    }, { 
      headers: { 
        'Content-Type': 'application/json'
      },
      params: {
        key: process.env.GEMINI_API_KEY
      },
      timeout: 30000
    });

    let answer = "I couldn't generate an answer at this time.";
    
    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      answer = response.data.candidates[0].content.parts[0].text;
    }

    return { 
      success: true,
      answer, 
      hits,
      sources,
      websites,
      websiteFilter: filter.website || null,
      context_used: hits.length
    };

  } catch (error) {
    console.error("RAG answer generation error:", error.message);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.response.statusText;
      
      if (status === 401) {
        return { success: false, error: "Invalid Gemini API key for text generation" };
      } else if (status === 429) {
        return { success: false, error: "Rate limit exceeded for text generation, please try again later" };
      } else if (status === 400) {
        return { success: false, error: `Invalid request to Gemini API: ${message}` };
      } else {
        return { success: false, error: `Text generation API error (${status}): ${message}` };
      }
    } else if (error.code === 'ECONNREFUSED') {
      return { success: false, error: "Cannot connect to Gemini API" };
    } else if (error.code === 'ETIMEDOUT') {
      return { success: false, error: "Request to Gemini API timed out" };
    } else {
      return { success: false, error: `Answer generation failed: ${error.message}` };
    }
  }
}

module.exports = { answerQuestion };
