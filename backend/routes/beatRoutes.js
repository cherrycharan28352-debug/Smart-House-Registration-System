const express = require('express');
const router = express.Router();
const {
  getBeats,
  getBeatByNumber,
  updateBeat,
  addVillageToBeat
} = require('../controllers/beatController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public or authenticated list of 11 beats
router.get('/', getBeats);
router.get('/:beatNumber', getBeatByNumber);

// Strictly Admin-only management of beats and villages
router.put('/:beatNumber', protect, authorize('admin'), updateBeat);
router.post('/:beatNumber/villages', protect, authorize('admin'), addVillageToBeat);

module.exports = router;
