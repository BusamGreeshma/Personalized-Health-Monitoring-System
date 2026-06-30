const mongoose = require('mongoose');

const NutritionLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  foodName: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    default: 0 // grams
  },
  carbs: {
    type: Number,
    default: 0 // grams
  },
  fats: {
    type: Number,
    default: 0 // grams
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NutritionLog', NutritionLogSchema);
