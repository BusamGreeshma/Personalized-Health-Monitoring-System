const mongoose = require('mongoose');

const VectorDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String, // e.g. diabetes, sleep, diet, heart_health
    required: true
  },
  content: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number], // array of floats from Gemini Embedding
    required: true
  }
}, {
  timestamps: true
});

// Index to help speed up vector queries
VectorDocumentSchema.index({ category: 1 });

module.exports = mongoose.model('VectorDocument', VectorDocumentSchema);
