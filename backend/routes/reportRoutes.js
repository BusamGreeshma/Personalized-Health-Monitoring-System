const express = require('express');
const router = express.Router();
const {
  uploadReport,
  getReports,
  getReportById,
  deleteReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/upload', upload.single('report'), uploadReport);
router.get('/', getReports);
router.route('/:id')
  .get(getReportById)
  .delete(deleteReport);

module.exports = router;
