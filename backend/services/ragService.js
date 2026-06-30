const VectorDocument = require('../models/VectorDocument');
const geminiService = require('./geminiService');

// Helper to calculate cosine similarity
const cosineSimilarity = (vecA, vecB) => {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Retrieve top relevant vector documents matching the user query
 * @param {string} query - user question
 * @param {string} [category] - optional category filter
 * @param {number} [limit=3] - max documents to retrieve
 */
exports.searchKnowledgeBase = async (query, category = null, limit = 3) => {
  try {
    // 1. Generate query embedding
    const queryVector = await geminiService.generateEmbeddings(query);

    // 2. Load candidate vector documents
    const filter = category ? { category } : {};
    const docs = await VectorDocument.find(filter);

    if (docs.length === 0) {
      return [];
    }

    // 3. Compute similarities
    const scoredDocs = docs.map(doc => {
      const score = cosineSimilarity(queryVector, doc.embedding);
      return {
        title: doc.title,
        category: doc.category,
        content: doc.content,
        score
      };
    });

    // 4. Sort and return top matches above a threshold
    scoredDocs.sort((a, b) => b.score - a.score);
    return scoredDocs.slice(0, limit).filter(doc => doc.score > 0.1);
  } catch (error) {
    console.error("Error in searchKnowledgeBase RAG:", error);
    return [];
  }
};
