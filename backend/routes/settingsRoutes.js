const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Strictly Admin-only system configuration & census parameters
router.get('/', protect, authorize('admin'), getSettings);
router.put('/', protect, authorize('admin'), updateSettings);

module.exports = router;
