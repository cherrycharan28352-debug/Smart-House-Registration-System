const mongoose = require('mongoose');

const backupRecordSchema = new mongoose.Schema(
  {
    backupId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    filename: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    sizeBytes: {
      type: Number,
      default: 0
    },
    sizeFormatted: {
      type: String,
      default: '0 KB'
    },
    checksumSha256: {
      type: String,
      required: true
    },
    triggerType: {
      type: String,
      enum: ['scheduled', 'manual', 'pre_restore_safety'],
      default: 'manual',
      index: true
    },
    status: {
      type: String,
      enum: ['completed', 'failed', 'in_progress'],
      default: 'in_progress',
      index: true
    },
    scope: {
      type: String,
      default: 'full_database_and_photos'
    },
    documentCounts: {
      houses: { type: Number, default: 0 },
      owners: { type: Number, default: 0 },
      familyMembers: { type: Number, default: 0 },
      beats: { type: Number, default: 0 },
      villages: { type: Number, default: 0 },
      users: { type: Number, default: 0 },
      housePhotos: { type: Number, default: 0 },
      settings: { type: Number, default: 0 },
      auditLogs: { type: Number, default: 0 },
      totalDocuments: { type: Number, default: 0 }
    },
    photoFileCount: {
      type: Number,
      default: 0
    },
    photoTotalBytes: {
      type: Number,
      default: 0
    },
    integrityVerified: {
      type: Boolean,
      default: true
    },
    integrityVerifiedAt: {
      type: Date,
      default: Date.now
    },
    integrityDetails: {
      type: String,
      default: 'SHA-256 Checksum and archive structure verified'
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    },
    durationMs: {
      type: Number,
      default: 0
    },
    errorDetails: {
      type: String,
      default: null
    },
    retentionDays: {
      type: Number,
      default: 30
    },
    expiresAt: {
      type: Date,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    createdByName: {
      type: String,
      default: 'System Scheduler'
    }
  },
  {
    timestamps: true
  }
);

// Index for chronological retrieval
backupRecordSchema.index({ createdAt: -1 });

module.exports = mongoose.model('BackupRecord', backupRecordSchema);
