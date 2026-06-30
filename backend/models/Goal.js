const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['steps', 'water', 'calories', 'sleep'],
    required: true
  },
  targetValue: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    default: 0
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// User can have one target per type per day
GoalSchema.index({ user: 1, type: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Goal', GoalSchema);
