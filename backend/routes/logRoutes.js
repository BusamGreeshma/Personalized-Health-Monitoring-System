const express = require('express');
const router = express.Router();
const {
  getDailySummary,
  updateHealthLog,
  logNutrition,
  logFitness,
  logSleep,
  logMood,
  getTrends,
  syncWearableData
} = require('../controllers/logController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary/:date', getDailySummary);
router.post('/health', updateHealthLog);
router.post('/nutrition', logNutrition);
router.post('/fitness', logFitness);
router.post('/sleep', logSleep);
router.post('/mood', logMood);
router.get('/trends/:range', getTrends);
router.post('/sync-wearable', syncWearableData);

module.exports = router;
