const mongoose = require('mongoose');

const HealthLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  waterIntake: {
    type: Number, // in ml
    default: 0
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  sleepHours: {
    type: Number,
    default: 0
  },
  heartRate: {
    type: Number,
    default: 72 // bpm
  },
  bloodPressure: {
    systolic: { type: Number, default: 120 },
    diastolic: { type: Number, default: 80 }
  },
  bloodSugar: {
    type: Number,
    default: 90 // mg/dL
  },
  oxygenLevel: {
    type: Number,
    default: 98 // %
  },
  weight: {
    type: Number,
    default: 70 // kg
  },
  bmi: {
    type: Number,
    default: 24.2
  },
  stepCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index so a user only has one overall health log per day
HealthLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HealthLog', HealthLogSchema);
