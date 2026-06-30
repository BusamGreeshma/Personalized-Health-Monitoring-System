const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    age: { type: Number, default: 30 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    height: { type: Number, default: 170 }, // cm
    weight: { type: Number, default: 70 },  // kg
    activityLevel: { 
      type: String, 
      enum: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'],
      default: 'Moderately Active'
    },
    diseases: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    emergencyContacts: [{
      name: { type: String, required: true },
      relation: { type: String, required: true },
      phone: { type: String, required: true }
    }]
  },
  badges: [{
    name: String,
    description: String,
    dateEarned: { type: Date, default: Date.now }
  }],
  streak: {
    type: Number,
    default: 0
  },
  lastLogDate: {
    type: String // YYYY-MM-DD
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
