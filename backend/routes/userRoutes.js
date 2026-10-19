const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  approveStaff,
  rejectStaff,
  updateStaffStatus,
  assignStaffJurisdiction,
  getAuditLogs
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

// Audit logs
router.get('/audit-logs', getAuditLogs);

// Pending staff quick filter
router.get('/pending', (req, res, next) => {
  req.query.status = 'pending';
  return getUsers(req, res, next);
});

// Staff management actions
router.put('/:id/approve', approveStaff);
router.put('/:id/reject', rejectStaff);
router.put('/:id/status', updateStaffStatus);
router.put('/:id/assign', assignStaffJurisdiction);

// Standard user CRUD
router.route('/').get(getUsers).post(createUser);
router.route('/:id').put(updateUser).delete(deleteUser);

module.exports = router;
