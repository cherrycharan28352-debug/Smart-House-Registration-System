const express = require('express');
const router = express.Router();
const {
  getHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
  getLocalities,
  addHouseIssue,
  updateIssueAction,
  updateHouseSecurity,
  getIssuesLedger
} = require('../controllers/houseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Locality metadata route
router.get('/meta/localities', protect, getLocalities);

// Global issues ledger route (must be before /:id)
router.get('/issues/ledger', protect, getIssuesLedger);

// Core CRUD routes
router
  .route('/')
  .get(protect, getHouses)
  .post(protect, authorize('admin', 'staff'), createHouse);

// Issue and Security sub-routes for specific house
router.post('/:id/issues', protect, authorize('admin', 'staff'), addHouseIssue);
router.put('/:id/issues/:issueId/action', protect, authorize('admin'), updateIssueAction);
router.put('/:id/security', protect, authorize('admin'), updateHouseSecurity);

router
  .route('/:id')
  .get(protect, getHouseById)
  .put(protect, authorize('admin', 'staff'), updateHouse)
  .delete(protect, authorize('admin'), deleteHouse);

module.exports = router;
