const Chat = require('../models/Chat');
const User = require('../models/User');
const HealthLog = require('../models/HealthLog');
const geminiService = require('../services/geminiService');
const ragService = require('../services/ragService');

// @desc    Get user's chat sessions
// @route   GET /api/ai/chat/sessions
// @access  Private
exports.getChatSessions = async (req, res) => {
  try {
    const sessions = await Chat.find({ user: req.user._id })
      .select('sessionName createdAt updatedAt')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get messages for a specific chat session
// @route   GET /api/ai/chat/sessions/:id
// @access  Private
exports.getSessionMessages = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }
    res.json({ success: true, data: chat.messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message to AI Assistant
// @route   POST /api/ai/chat
// @access  Private
exports.sendChatMessage = async (req, res) => {
  try {
    const { text, sessionId } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Please provide a message text' });
    }

    let chatSession;

    // Check if continuing existing session or creating new
    if (sessionId) {
      chatSession = await Chat.findOne({ _id: sessionId, user: req.user._id });
    }

    if (!chatSession) {
      // Create new session
      const name = text.slice(0, 30) + (text.length > 30 ? '...' : '');
      chatSession = new Chat({
        user: req.user._id,
        sessionName: name,
        messages: []
      });
    }

    // 1. Fetch relevant knowledge articles via RAG
    const ragContext = await ragService.searchKnowledgeBase(text, null, 2);

    // 2. Format previous messages as history
    const history = chatSession.messages.map(msg => ({
      sender: msg.sender,
      text: msg.text
    }));

    // 3. Generate Gemini response
    const aiResponseText = await geminiService.generateChatResponse(history, text, ragContext);

    // 4. Save messages in session
    chatSession.messages.push({ sender: 'user', text });
    chatSession.messages.push({ sender: 'ai', text: aiResponseText });
    await chatSession.save();

    res.json({
      success: true,
      data: {
        sessionId: chatSession._id,
        sessionName: chatSession.sessionName,
        message: { sender: 'ai', text: aiResponseText, timestamp: new Date() }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate AI Health Score
// @route   GET /api/ai/health-score
// @access  Private
exports.getHealthScore = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Fetch latest 7 health logs for context
    const recentLogs = await HealthLog.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(7);

    // Generate score
    const healthScoreResult = await geminiService.generateHealthScore(user, recentLogs);
    
    res.json({ success: true, data: healthScoreResult });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Predict Health Risks
// @route   GET /api/ai/predict-risk
// @access  Private
exports.predictHealthRisk = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Fetch latest 10 health logs
    const logs = await HealthLog.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(10);

    const risks = await geminiService.predictHealthRisk(user, logs);
    res.json({ success: true, data: risks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Personalized Health Recommendations
// @route   GET /api/ai/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Fetch latest 5 health logs
    const logs = await HealthLog.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    const plans = await geminiService.generatePersonalizedPlans(user, logs);
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
