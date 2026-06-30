const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getAppointments,
  updateAppointment,
  cancelAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(bookAppointment)
  .get(getAppointments);

router.route('/:id')
  .put(updateAppointment)
  .delete(cancelAppointment);

module.exports = router;
