const Medication = require('../models/Medication');

// @desc    Add a new medication
// @route   POST /api/medications
// @access  Private
exports.addMedication = async (req, res) => {
  try {
    const { name, dosage, frequency, times, startDate, endDate, remindersEnabled } = req.body;
    
    const medication = await Medication.create({
      user: req.user._id,
      name,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      remindersEnabled
    });

    res.status(201).json({ success: true, data: medication });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all user medications
// @route   GET /api/medications
// @access  Private
exports.getMedications = async (req, res) => {
  try {
    const medications = await Medication.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: medications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark medication dose as taken or missed
// @route   POST /api/medications/:id/log
// @access  Private
exports.logMedicationStatus = async (req, res) => {
  try {
    const { date, time, status } = req.body; // status: 'taken', 'missed'
    const medication = await Medication.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication schedule not found' });
    }

    // Check if entry already exists, update it, otherwise push new log
    const index = medication.logs.findIndex(log => log.date === date && log.time === time);
    if (index !== -1) {
      medication.logs[index].status = status;
    } else {
      medication.logs.push({ date, time, status });
    }

    await medication.save();
    res.json({ success: true, data: medication });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a medication schedule
// @route   DELETE /api/medications/:id
// @access  Private
exports.deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medication schedule not found' });
    }
    res.json({ success: true, message: 'Medication schedule deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
