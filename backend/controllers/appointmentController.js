const Appointment = require('../models/Appointment');

// @desc    Book a new doctor appointment
// @route   POST /api/appointments
// @access  Private
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorName, specialty, dateTime, notes, reminderMinutesBefore } = req.body;

    const appointment = await Appointment.create({
      user: req.user._id,
      doctorName,
      specialty,
      dateTime,
      notes,
      reminderMinutesBefore
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user appointments list
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id }).sort({ dateTime: 1 });
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment details/status
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res) => {
  try {
    const { status, notes, dateTime } = req.body;
    const appointment = await Appointment.findOne({ _id: req.params.id, user: req.user._id });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (status !== undefined) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    if (dateTime !== undefined) appointment.dateTime = dateTime;

    await appointment.save();
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel an appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, user: req.user._id });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ success: true, message: 'Appointment cancelled successfully', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
