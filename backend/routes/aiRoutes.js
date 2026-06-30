const express = require('express');
const router = express.Router();
const {
  getChatSessions,
  getSessionMessages,
  sendChatMessage,
  getHealthScore,
  predictHealthRisk,
  getRecommendations
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/chat', sendChatMessage);
router.get('/chat/sessions', getChatSessions);
router.get('/chat/sessions/:id', getSessionMessages);
router.get('/health-score', getHealthScore);
router.get('/predict-risk', predictHealthRisk);
router.get('/recommendations', getRecommendations);

module.exports = router;
