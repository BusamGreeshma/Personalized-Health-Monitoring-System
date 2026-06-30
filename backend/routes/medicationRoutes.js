const express = require('express');
const router = express.Router();
const {
  addMedication,
  getMedications,
  logMedicationStatus,
  deleteMedication
} = require('../controllers/medicationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(addMedication)
  .get(getMedications);

router.post('/:id/log', logMedicationStatus);
router.delete('/:id', deleteMedication);

module.exports = router;
