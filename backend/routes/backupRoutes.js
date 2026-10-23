const express = require('express');
const router = express.Router();
const {
  getBackupOverview,
  listBackups,
  createManualBackup,
  verifyBackup,
  restoreFromBackup,
  downloadBackup,
  deleteBackup,
  getRestoreHistory,
  updateBackupSettings
} = require('../controllers/backupController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All backup & restore routes are strictly protected for Admin role only
router.use(protect);
router.use(authorize('admin'));

// Storage & Backup Overview
router.get('/overview', getBackupOverview);

// List Backups with pagination & filters
router.get('/list', listBackups);

// Trigger Manual Backup
router.post('/create', createManualBackup);

// Verify Backup Integrity
router.post('/:backupId/verify', verifyBackup);

// Safe Restore from Backup
router.post('/:backupId/restore', restoreFromBackup);

// Secure Authenticated Download
router.get('/:backupId/download', downloadBackup);

// Delete Backup Archive
router.delete('/:backupId', deleteBackup);

// Restore Operation History
router.get('/restore-history', getRestoreHistory);

// Update Backup Schedule & Retention Settings
router.put('/settings', updateBackupSettings);

module.exports = router;
