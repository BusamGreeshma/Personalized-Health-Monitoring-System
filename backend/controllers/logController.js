const HealthLog = require('../models/HealthLog');
const NutritionLog = require('../models/NutritionLog');
const FitnessLog = require('../models/FitnessLog');
const SleepLog = require('../models/SleepLog');
const MoodLog = require('../models/MoodLog');
const User = require('../models/User');
const Goal = require('../models/Goal');

// Helper to check and increment user streak
const updateStreak = async (user, dateStr) => {
  const today = new Date(dateStr);
  
  if (user.lastLogDate === dateStr) {
    return; // Already logged today, streak remains same
  }

  if (user.lastLogDate) {
    const lastLog = new Date(user.lastLogDate);
    const diffTime = Math.abs(today - lastLog);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      user.streak += 1;
      // Award badge for streaks
      if (user.streak === 3 && !user.badges.some(b => b.name === 'Consistent Logger')) {
        user.badges.push({ name: 'Consistent Logger', description: 'Log health data 3 days in a row' });
      }
      if (user.streak === 7 && !user.badges.some(b => b.name === 'Health Master')) {
        user.badges.push({ name: 'Health Master', description: 'Log health data 7 days in a row' });
      }
    } else if (diffDays > 1) {
      user.streak = 1; // reset streak
    }
  } else {
    user.streak = 1; // first streak
  }

  user.lastLogDate = dateStr;
  await user.save();
};

// @desc    Get daily summary (combined metrics) for a date
// @route   GET /api/logs/summary/:date
// @access  Private
exports.getDailySummary = async (req, res) => {
  try {
    const { date } = req.params; // YYYY-MM-DD
    
    // Find or create daily HealthLog
    let log = await HealthLog.findOne({ user: req.user._id, date });
    if (!log) {
      // Get user weight and height for BMI calculation
      const user = await User.findById(req.user._id);
      const bmi = user.profile.weight / ((user.profile.height / 100) ** 2);
      
      log = await HealthLog.create({
        user: req.user._id,
        date,
        weight: user.profile.weight,
        bmi: parseFloat(bmi.toFixed(1)),
        waterIntake: 0,
        caloriesBurned: 0,
        sleepHours: 0,
        stepCount: 0,
        heartRate: 72,
        bloodSugar: 90,
        oxygenLevel: 98,
        bloodPressure: { systolic: 120, diastolic: 80 }
      });
    }

    // Load sub-logs
    const meals = await NutritionLog.find({ user: req.user._id, date });
    const workouts = await FitnessLog.find({ user: req.user._id, date });
    const sleepLogs = await SleepLog.find({ user: req.user._id, date });
    const moodLogs = await MoodLog.find({ user: req.user._id, date });
    
    // Load daily goals progress
    let goals = await Goal.find({ user: req.user._id, date });
    if (goals.length === 0) {
      // Initialize daily default goals
      const defaultGoals = [
        { type: 'steps', targetValue: 8000, currentValue: log.stepCount },
        { type: 'water', targetValue: 2500, currentValue: log.waterIntake },
        { type: 'calories', targetValue: 500, currentValue: log.caloriesBurned },
        { type: 'sleep', targetValue: 8, currentValue: log.sleepHours }
      ];
      goals = await Goal.create(defaultGoals.map(g => ({ ...g, user: req.user._id, date })));
    }

    res.json({
      success: true,
      data: {
        summary: log,
        meals,
        workouts,
        sleepLogs,
        moodLogs,
        goals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update/create overall daily health vitals
// @route   POST /api/logs/health
// @access  Private
exports.updateHealthLog = async (req, res) => {
  try {
    const { date, waterIntake, caloriesBurned, sleepHours, heartRate, bloodPressure, bloodSugar, oxygenLevel, weight, stepCount } = req.body;
    
    let log = await HealthLog.findOne({ user: req.user._id, date });
    const user = await User.findById(req.user._id);

    const bmi = weight ? (weight / ((user.profile.height / 100) ** 2)) : (user.profile.weight / ((user.profile.height / 100) ** 2));

    if (log) {
      if (waterIntake !== undefined) log.waterIntake = waterIntake;
      if (caloriesBurned !== undefined) log.caloriesBurned = caloriesBurned;
      if (sleepHours !== undefined) log.sleepHours = sleepHours;
      if (heartRate !== undefined) log.heartRate = heartRate;
      if (bloodPressure !== undefined) log.bloodPressure = bloodPressure;
      if (bloodSugar !== undefined) log.bloodSugar = bloodSugar;
      if (oxygenLevel !== undefined) log.oxygenLevel = oxygenLevel;
      if (weight !== undefined) {
        log.weight = weight;
        log.bmi = parseFloat(bmi.toFixed(1));
      }
      if (stepCount !== undefined) log.stepCount = stepCount;
      
      await log.save();
    } else {
      log = await HealthLog.create({
        user: req.user._id,
        date,
        waterIntake: waterIntake || 0,
        caloriesBurned: caloriesBurned || 0,
        sleepHours: sleepHours || 0,
        heartRate: heartRate || 72,
        bloodPressure: bloodPressure || { systolic: 120, diastolic: 80 },
        bloodSugar: bloodSugar || 90,
        oxygenLevel: oxygenLevel || 98,
        weight: weight || user.profile.weight,
        bmi: parseFloat(bmi.toFixed(1)),
        stepCount: stepCount || 0
      });
    }

    // Sync targets progress
    await Goal.updateOne({ user: req.user._id, date, type: 'steps' }, { currentValue: log.stepCount, completed: log.stepCount >= 8000 });
    await Goal.updateOne({ user: req.user._id, date, type: 'water' }, { currentValue: log.waterIntake, completed: log.waterIntake >= 2500 });
    await Goal.updateOne({ user: req.user._id, date, type: 'calories' }, { currentValue: log.caloriesBurned, completed: log.caloriesBurned >= 500 });
    await Goal.updateOne({ user: req.user._id, date, type: 'sleep' }, { currentValue: log.sleepHours, completed: log.sleepHours >= 8 });

    // Update streak gamification
    await updateStreak(user, date);

    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log a meal (Nutrition)
// @route   POST /api/logs/nutrition
// @access  Private
exports.logNutrition = async (req, res) => {
  try {
    const { date, mealType, foodName, calories, protein, carbs, fats } = req.body;
    
    const log = await NutritionLog.create({
      user: req.user._id,
      date,
      mealType,
      foodName,
      calories,
      protein,
      carbs,
      fats
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log a workout (Fitness)
// @route   POST /api/logs/fitness
// @access  Private
exports.logFitness = async (req, res) => {
  try {
    const { date, activityType, duration, distance, caloriesBurned } = req.body;

    const fitnessLog = await FitnessLog.create({
      user: req.user._id,
      date,
      activityType,
      duration,
      distance,
      caloriesBurned
    });

    // Update the daily summary caloriesBurned and stepCount
    let healthLog = await HealthLog.findOne({ user: req.user._id, date });
    if (healthLog) {
      healthLog.caloriesBurned += caloriesBurned;
      if (activityType === 'walking' || activityType === 'running') {
        const addedSteps = Math.round(duration * (activityType === 'running' ? 160 : 100)); // estimate steps
        healthLog.stepCount += addedSteps;
      }
      await healthLog.save();
    }

    res.status(201).json({ success: true, data: fitnessLog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log sleep details
// @route   POST /api/logs/sleep
// @access  Private
exports.logSleep = async (req, res) => {
  try {
    const { date, duration, quality, bedtime, wakeupTime } = req.body;

    // AI suggestions based on sleep quality
    let suggestions = "Your sleep looks normal. Maintain a dark, cool bedroom atmosphere.";
    if (quality <= 2) {
      suggestions = "Quality is low. Try to limit screen exposure 1 hour before sleep and avoid caffeine past 2 PM.";
    } else if (quality >= 4) {
      suggestions = "Excellent sleep patterns! Continue maintaining this consistent bedtime schedule.";
    }

    const sleepLog = await SleepLog.create({
      user: req.user._id,
      date,
      duration,
      quality,
      bedtime,
      wakeupTime,
      suggestions
    });

    // Update sleepHours in daily health log
    let healthLog = await HealthLog.findOne({ user: req.user._id, date });
    if (healthLog) {
      healthLog.sleepHours = duration;
      await healthLog.save();
    }

    res.status(201).json({ success: true, data: sleepLog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log mood and stress levels
// @route   POST /api/logs/mood
// @access  Private
exports.logMood = async (req, res) => {
  try {
    const { date, mood, stressLevel, anxietyLevel, notes } = req.body;

    let suggestions = [];
    if (stressLevel > 6 || anxietyLevel > 6) {
      suggestions = [
        "Perform a 5-minute Box Breathing exercise (Inhale 4s, Hold 4s, Exhale 4s, Hold 4s).",
        "Try a Guided Progressive Muscle Relaxation session.",
        "Take a 15-minute screen-free outdoor walk."
      ];
    } else {
      suggestions = [
        "Great job maintaining mental wellness! Write down one thing you are grateful for today.",
        "Do a quick 5-minute mindfulness check-in."
      ];
    }

    const moodLog = await MoodLog.create({
      user: req.user._id,
      date,
      mood,
      stressLevel,
      anxietyLevel,
      notes,
      suggestions
    });

    res.status(201).json({ success: true, data: moodLog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get historical trends for vitals
// @route   GET /api/logs/trends/:range
// @access  Private
exports.getTrends = async (req, res) => {
  try {
    const { range } = req.params; // weekly, monthly, yearly
    let limit = 7;
    if (range === 'monthly') limit = 30;
    if (range === 'yearly') limit = 365;

    const logs = await HealthLog.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(limit);

    // Return in chronological order
    res.json({ success: true, data: logs.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Simulate wearable device sync (Google Fit / Fitbit / Apple Health)
// @route   POST /api/logs/sync-wearable
// @access  Private
exports.syncWearableData = async (req, res) => {
  try {
    const { date } = req.body; // YYYY-MM-DD
    if (!date) {
      return res.status(400).json({ success: false, message: 'Please provide a date' });
    }

    // Generate random but realistic health metrics
    const simulatedSteps = Math.floor(Math.random() * 6000) + 4000; // 4000 to 10000
    const simulatedWater = Math.floor(Math.random() * 1500) + 1000; // 1000 to 2500 ml
    const simulatedSleep = parseFloat((Math.random() * 3 + 5.5).toFixed(1)); // 5.5 to 8.5 hours
    const simulatedCalories = Math.floor(simulatedSteps * 0.04) + 150; // calories burned from steps + base
    const simulatedHeartRate = Math.floor(Math.random() * 20) + 65; // 65 to 85 bpm
    const simulatedOxygen = Math.floor(Math.random() * 4) + 96; // 96% to 99%

    let log = await HealthLog.findOne({ user: req.user._id, date });
    const user = await User.findById(req.user._id);

    if (log) {
      log.stepCount += simulatedSteps;
      log.waterIntake += simulatedWater;
      log.sleepHours = simulatedSleep;
      log.caloriesBurned += simulatedCalories;
      log.heartRate = simulatedHeartRate;
      log.oxygenLevel = simulatedOxygen;
      await log.save();
    } else {
      const bmi = user.profile.weight / ((user.profile.height / 100) ** 2);
      log = await HealthLog.create({
        user: req.user._id,
        date,
        stepCount: simulatedSteps,
        waterIntake: simulatedWater,
        sleepHours: simulatedSleep,
        caloriesBurned: simulatedCalories,
        heartRate: simulatedHeartRate,
        oxygenLevel: simulatedOxygen,
        weight: user.profile.weight,
        bmi: parseFloat(bmi.toFixed(1)),
        bloodPressure: { systolic: 118, diastolic: 76 },
        bloodSugar: 88
      });
    }

    // Update goals
    await Goal.updateOne({ user: req.user._id, date, type: 'steps' }, { currentValue: log.stepCount, completed: log.stepCount >= 8000 });
    await Goal.updateOne({ user: req.user._id, date, type: 'water' }, { currentValue: log.waterIntake, completed: log.waterIntake >= 2500 });
    await Goal.updateOne({ user: req.user._id, date, type: 'calories' }, { currentValue: log.caloriesBurned, completed: log.caloriesBurned >= 500 });
    await Goal.updateOne({ user: req.user._id, date, type: 'sleep' }, { currentValue: log.sleepHours, completed: log.sleepHours >= 8 });

    await updateStreak(user, date);

    res.json({
      success: true,
      message: 'Successfully synchronized data from simulated Google Fit/Fitbit!',
      data: log
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
