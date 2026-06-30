const mongoose = require('mongoose');

const SleepLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  duration: {
    type: Number, // in hours
    required: true
  },
  quality: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  bedtime: {
    type: String, // Format: HH:MM
    required: true
  },
  wakeupTime: {
    type: String, // Format: HH:MM
    required: true
  },
  suggestions: {
    type: String // AI generated suggestions
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SleepLog', SleepLogSchema);
