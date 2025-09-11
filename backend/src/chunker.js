// src/chunker.js
// Option A: char-based chunker (simple, reliable)
function chunkTextByChars(text, chunkSize = 1500, overlap = 200) {
  try {
    // Input validation
    if (!text || typeof text !== 'string') {
      return { success: false, error: "Invalid input: text must be a non-empty string" };
    }

    if (chunkSize <= 0 || chunkSize > 10000) {
      return { success: false, error: "Chunk size must be between 1 and 10000 characters" };
    }

    if (overlap < 0 || overlap >= chunkSize) {
      return { success: false, error: "Overlap must be between 0 and chunk size" };
    }

    const chunks = [];
    let start = 0;
    
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.slice(start, end).trim();
      
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      
      start += (chunkSize - overlap);
    }

    return { success: true, chunks };

  } catch (error) {
    console.error("Text chunking error:", error.message);
    return { success: false, error: `Text chunking failed: ${error.message}` };
  }
}

module.exports = { chunkTextByChars };

