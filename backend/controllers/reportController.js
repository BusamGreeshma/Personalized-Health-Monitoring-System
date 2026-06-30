const fs = require('fs');
const path = require('path');
const tesseract = require('tesseract.js');
const Report = require('../models/Report');
const geminiService = require('../services/geminiService');

// @desc    Upload and analyze medical report
// @route   POST /api/reports/upload
// @access  Private
exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a medical report file (Image or PDF)' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let base64Data = '';
    let mimeType = '';
    let extractedText = '';

    // Convert file to base64 for Gemini vision upload
    const fileBuffer = fs.readFileSync(filePath);
    base64Data = fileBuffer.toString('base64');
    mimeType = req.file.mimetype;

    // Run local OCR if image as fallback context
    if (fileExtension === '.png' || fileExtension === '.jpg' || fileExtension === '.jpeg') {
      try {
        const ocrResult = await tesseract.recognize(filePath, 'eng');
        extractedText = ocrResult.data.text;
      } catch (ocrErr) {
        console.warn("Local Tesseract OCR failed, falling back to Gemini Vision:", ocrErr.message);
      }
    } else {
      extractedText = "PDF Lab Report Uploaded";
    }

    // Call Gemini API to extract parameter values
    const analysis = await geminiService.analyzeMedicalReport(extractedText, base64Data, mimeType);

    // Save report analysis to DB
    const report = await Report.create({
      user: req.user._id,
      title: analysis.title || path.basename(req.file.originalname, fileExtension),
      fileUrl: `/uploads/${req.file.filename}`, // relative static file path
      fileType: fileExtension.substring(1).toUpperCase(),
      extractedText: extractedText || 'Analyzed via Multimodal AI directly.',
      aiSummary: analysis.aiSummary,
      abnormalValues: analysis.abnormalValues || [],
      lifestyleSuggestions: analysis.lifestyleSuggestions || []
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error("Report Upload Controller Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all medical reports for user
// @route   GET /api/reports
// @access  Private
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({ analyzedAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get report detail by ID
// @route   GET /api/reports/:id
// @access  Private
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Medical report not found' });
    }
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete medical report
// @route   DELETE /api/reports/:id
// @access  Private
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Medical report not found' });
    }

    // Try deleting physical file from uploads folder
    const physicalPath = path.join(__dirname, '..', report.fileUrl);
    if (fs.existsSync(physicalPath)) {
      fs.unlinkSync(physicalPath);
    }

    await Report.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
