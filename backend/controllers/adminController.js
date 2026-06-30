const User = require('../models/User');
const HealthLog = require('../models/HealthLog');
const Chat = require('../models/Chat');
const Report = require('../models/Report');

// @desc    Get admin panel statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalLogs = await HealthLog.countDocuments();
    const totalReports = await Report.countDocuments();
    
    // Count chat sessions and messages for AI usage
    const chats = await Chat.find();
    let totalMessages = 0;
    chats.forEach(c => {
      totalMessages += c.messages.length;
    });

    // Get average Health Score from logs
    const logs = await HealthLog.find().select('bmi heartRate stepCount sleepHours');
    let avgSteps = 0;
    let avgSleep = 0;
    if (logs.length > 0) {
      const sumSteps = logs.reduce((sum, log) => sum + (log.stepCount || 0), 0);
      const sumSleep = logs.reduce((sum, log) => sum + (log.sleepHours || 0), 0);
      avgSteps = Math.round(sumSteps / logs.length);
      avgSleep = parseFloat((sumSleep / logs.length).toFixed(1));
    }

    // Risk profiles mock/aggregated summary for Expo dashboard visualizer
    const users = await User.find({ role: 'user' });
    const genderRatio = { Male: 0, Female: 0, Other: 0 };
    let totalAge = 0;
    users.forEach(u => {
      if (u.profile.gender) {
        genderRatio[u.profile.gender] = (genderRatio[u.profile.gender] || 0) + 1;
      }
      totalAge += u.profile.age || 30;
    });
    const avgAge = users.length > 0 ? Math.round(totalAge / users.length) : 30;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalLogs,
        totalReports,
        aiUsage: {
          sessions: chats.length,
          messages: totalMessages
        },
        healthTrends: {
          avgSteps,
          avgSleep
        },
        demographics: {
          avgAge,
          genderRatio
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get list of all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();
    
    res.json({ success: true, message: `Successfully updated user role to ${role}`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.deleteOne({ _id: req.params.id });
    // Also delete logs, reports, etc.
    await HealthLog.deleteMany({ user: req.params.id });
    await Chat.deleteMany({ user: req.params.id });
    await Report.deleteMany({ user: req.params.id });

    res.json({ success: true, message: 'User and all related records deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
