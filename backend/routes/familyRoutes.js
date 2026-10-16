const express = require('express');
const router = express.Router();
const {
  getFamilyByHouseId,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  getAllFamilyMembers
} = require('../controllers/familyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/all', protect, getAllFamilyMembers);
router.get('/:id/family', protect, getFamilyByHouseId);
router.post('/:id/family', protect, authorize('admin', 'staff'), addFamilyMember);
router.put('/:memberId', protect, authorize('admin', 'staff'), updateFamilyMember);
router.delete('/:memberId', protect, authorize('admin', 'staff'), deleteFamilyMember);

module.exports = router;
