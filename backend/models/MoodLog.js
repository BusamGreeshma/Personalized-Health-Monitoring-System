const mongoose = require('mongoose');

const MoodLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  mood: {
    type: String,
    enum: ['happy', 'stressed', 'anxious', 'sad', 'neutral'],
    required: true
  },
  stressLevel: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  anxietyLevel: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  notes: {
    type: String
  },
  suggestions: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MoodLog', MoodLogSchema);
