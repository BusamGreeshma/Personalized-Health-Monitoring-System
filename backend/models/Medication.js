const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String, // e.g. "1 tablet", "5ml"
    required: true
  },
  frequency: {
    type: String, // e.g. "Daily", "Weekly", "Twice a day"
    required: true
  },
  times: {
    type: [String], // Array of times e.g. ["08:00", "20:00"]
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  remindersEnabled: {
    type: Boolean,
    default: true
  },
  logs: [{
    date: String, // YYYY-MM-DD
    time: String, // HH:MM
    status: {
      type: String,
      enum: ['taken', 'missed'],
      default: 'taken'
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Medication', MedicationSchema);
