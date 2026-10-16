const express = require('express');
const router = express.Router();
const {
  getOwnerByHouseId,
  updateOwnerByHouseId,
  getAllOwners
} = require('../controllers/ownerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getAllOwners);
router.get('/:id/owner', protect, getOwnerByHouseId);
router.put('/:id/owner', protect, authorize('admin', 'staff'), updateOwnerByHouseId);

module.exports = router;
