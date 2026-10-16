const express = require('express');
const router = express.Router();
const {
  getVillageDetails,
  updateVillage,
  deleteVillage
} = require('../controllers/beatController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/:id', protect, getVillageDetails);

// Strictly Admin-only management of villages
router.put('/:id', protect, authorize('admin'), updateVillage);
router.delete('/:id', protect, authorize('admin'), deleteVillage);

module.exports = router;
