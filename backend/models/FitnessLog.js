const mongoose = require('mongoose');

const FitnessLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  activityType: {
    type: String,
    enum: ['walking', 'running', 'cycling', 'gym', 'other'],
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  distance: {
    type: Number, // in km
    default: 0
  },
  caloriesBurned: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FitnessLog', FitnessLogSchema);
