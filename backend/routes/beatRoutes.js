const express = require('express');
const router = express.Router();
const {
  getBeats,
  getBeatByNumber,
  updateBeat,
  addVillageToBeat
} = require('../controllers/beatController');
const { protect, authorize, optionalProtect } = require('../middleware/authMiddleware');

// List of beats: public (for registration) or scoped for authenticated staff
router.get('/', optionalProtect, getBeats);
// Individual beat details: protected and restricted by staff beat jurisdiction
router.get('/:beatNumber', protect, getBeatByNumber);

// Strictly Admin-only management of beats and villages
router.put('/:beatNumber', protect, authorize('admin'), updateBeat);
router.post('/:beatNumber/villages', protect, authorize('admin'), addVillageToBeat);

module.exports = router;
