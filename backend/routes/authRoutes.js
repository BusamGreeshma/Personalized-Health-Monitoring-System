const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  getPublicEmergencyProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/public-profile/:userId', getPublicEmergencyProfile);

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

module.exports = router;
