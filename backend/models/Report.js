const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String // File Base64 or local server path
  },
  fileType: {
    type: String // PDF, PNG, JPEG
  },
  extractedText: {
    type: String
  },
  aiSummary: {
    type: String
  },
  abnormalValues: [{
    parameter: String, // e.g. Glucose, Hemoglobin
    value: String,     // e.g. 145 mg/dL
    normalRange: String, // e.g. 70-100 mg/dL
    status: {
      type: String,
      enum: ['high', 'low', 'normal'],
      default: 'normal'
    }
  }],
  lifestyleSuggestions: {
    type: [String],
    default: []
  },
  analyzedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', ReportSchema);
