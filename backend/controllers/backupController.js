const fs = require('fs');
const path = require('path');
const BackupRecord = require('../models/BackupRecord');
const RestoreRecord = require('../models/RestoreRecord');
const Settings = require('../models/Settings');
const AuditLog = require('../models/AuditLog');
const backupService = require('../services/backupService');

/**
 * @desc Get comprehensive Backup & Storage overview
 * @route GET /api/backup/overview
 * @access Private/Admin
 */
exports.getBackupOverview = async (req, res, next) => {
  try {
    const storageStats = await backupService.getStorageStats();
    const settings = await Settings.findOne({});
    const backupSettings = settings?.backupSettings || {
      autoBackupEnabled: true,
      frequency: 'daily',
      retentionDays: 30,
      lastBackupAt: null,
      nextBackupAt: null
    };

    const latestBackups = await BackupRecord.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const latestRestores = await RestoreRecord.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const totalBackupsCount = await BackupRecord.countDocuments({ status: 'completed' });
    const lastSuccessfulBackup = await BackupRecord.findOne({ status: 'completed' })
      .sort({ completedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        storage: storageStats,
        backupSettings,
        stats: {
          totalBackups: totalBackupsCount,
          lastSuccessfulBackup: lastSuccessfulBackup
            ? {
                backupId: lastSuccessfulBackup.backupId,
                filename: lastSuccessfulBackup.filename,
                sizeFormatted: lastSuccessfulBackup.sizeFormatted,
                completedAt: lastSuccessfulBackup.completedAt,
                triggerType: lastSuccessfulBackup.triggerType,
                totalDocuments: lastSuccessfulBackup.documentCounts?.totalDocuments || 0,
                photoFilesIncluded: lastSuccessfulBackup.photoFileCount || 0
              }
            : null
        },
        recentBackups: latestBackups,
        recentRestores: latestRestores
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc List all backups with pagination & filtering
 * @route GET /api/backup/list
 * @access Private/Admin
 */
exports.listBackups = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.triggerType) {
      query.triggerType = req.query.triggerType;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const [backups, total] = await Promise.all([
      BackupRecord.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      BackupRecord.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: backups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Trigger manual backup creation
 * @route POST /api/backup/create
 * @access Private/Admin
 */
exports.createManualBackup = async (req, res, next) => {
  try {
    const createdBy = req.user?._id || null;
    const createdByName = req.user?.fullName || req.user?.username || 'Admin';

    const backupRecord = await backupService.createBackup({
      triggerType: 'manual',
      createdBy,
      createdByName,
      retentionDays: req.body.retentionDays || 30
    });

    res.status(201).json({
      success: true,
      message: `Backup ${backupRecord.backupId} created and cryptographically verified!`,
      data: backupRecord
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Verify cryptographic and structural integrity of a backup
 * @route POST /api/backup/:backupId/verify
 * @access Private/Admin
 */
exports.verifyBackup = async (req, res, next) => {
  try {
    const { backupId } = req.params;
    const report = await backupService.verifyBackupIntegrity(backupId);

    if (!report.success) {
      return res.status(400).json({
        success: false,
        message: report.message,
        data: report
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cryptographic SHA-256 and archive integrity verified successfully!',
      data: report
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Safely restore database and photos from verified backup
 * @route POST /api/backup/:backupId/restore
 * @access Private/Admin
 */
exports.restoreFromBackup = async (req, res, next) => {
  try {
    const { backupId } = req.params;
    const { confirmation, testMode = false } = req.body;

    // Strict confirmation guard
    if (confirmation !== 'RESTORE') {
      return res.status(400).json({
        success: false,
        message: 'Explicit safety confirmation required! You must type "RESTORE" to confirm this action.'
      });
    }

    const restoredBy = req.user?._id || null;
    const restoredByName = req.user?.fullName || req.user?.username || 'Admin';
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';

    const result = await backupService.restoreBackup({
      backupId,
      restoredBy,
      restoredByName,
      ipAddress,
      testMode
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Securely download backup archive file
 * @route GET /api/backup/:backupId/download
 * @access Private/Admin
 */
exports.downloadBackup = async (req, res, next) => {
  try {
    const { backupId } = req.params;
    const backup = await BackupRecord.findOne({ backupId });

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup record not found'
      });
    }

    if (!fs.existsSync(backup.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Backup archive file is missing on storage server'
      });
    }

    // Audit log download action
    await AuditLog.create({
      action: 'BACKUP_DOWNLOADED',
      performedBy: req.user?._id,
      performedByName: req.user?.fullName || req.user?.username,
      targetResource: `BackupRecord:${backupId}`,
      details: { filename: backup.filename, size: backup.sizeFormatted },
      ipAddress: req.ip || req.headers['x-forwarded-for'] || ''
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${backup.filename}"`);
    res.setHeader('Content-Length', backup.sizeBytes);

    const fileStream = fs.createReadStream(backup.filePath);
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Delete a specific backup archive
 * @route DELETE /api/backup/:backupId
 * @access Private/Admin
 */
exports.deleteBackup = async (req, res, next) => {
  try {
    const { backupId } = req.params;
    const backup = await BackupRecord.findOne({ backupId });

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup record not found'
      });
    }

    // Safety snapshots cannot be deleted casually
    if (backup.triggerType === 'pre_restore_safety') {
      return res.status(400).json({
        success: false,
        message: 'Pre-restore safety snapshots are protected from deletion to ensure disaster recovery.'
      });
    }

    if (fs.existsSync(backup.filePath)) {
      try {
        fs.unlinkSync(backup.filePath);
      } catch (e) {}
    }

    await BackupRecord.deleteOne({ backupId });

    await AuditLog.create({
      action: 'BACKUP_DELETED',
      performedBy: req.user?._id,
      performedByName: req.user?.fullName || req.user?.username,
      targetResource: `BackupRecord:${backupId}`,
      details: { filename: backup.filename },
      ipAddress: req.ip || ''
    });

    res.status(200).json({
      success: true,
      message: `Backup archive ${backup.filename} deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get Restore History
 * @route GET /api/backup/restore-history
 * @access Private/Admin
 */
exports.getRestoreHistory = async (req, res, next) => {
  try {
    const history = await RestoreRecord.find({}).sort({ createdAt: -1 }).limit(50).lean();

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Update Backup Settings (Schedule & Retention)
 * @route PUT /api/backup/settings
 * @access Private/Admin
 */
exports.updateBackupSettings = async (req, res, next) => {
  try {
    const { autoBackupEnabled, frequency, retentionDays } = req.body;

    const settings = await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          'backupSettings.autoBackupEnabled': autoBackupEnabled !== undefined ? autoBackupEnabled : true,
          'backupSettings.frequency': frequency || 'daily',
          'backupSettings.retentionDays': Number(retentionDays) || 30
        }
      },
      { new: true, upsert: true }
    );

    await AuditLog.create({
      action: 'BACKUP_SETTINGS_UPDATED',
      performedBy: req.user?._id,
      performedByName: req.user?.fullName || req.user?.username,
      details: { autoBackupEnabled, frequency, retentionDays },
      ipAddress: req.ip || ''
    });

    res.status(200).json({
      success: true,
      message: 'Backup schedule and retention configuration saved successfully.',
      data: settings.backupSettings
    });
  } catch (err) {
    next(err);
  }
};
