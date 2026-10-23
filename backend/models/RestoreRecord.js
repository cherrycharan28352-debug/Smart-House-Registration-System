const mongoose = require('mongoose');

const restoreRecordSchema = new mongoose.Schema(
  {
    restoreId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    backupId: {
      type: String,
      required: true,
      index: true
    },
    backupFilename: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['completed', 'failed', 'in_progress'],
      default: 'in_progress',
      index: true
    },
    safetyBackupId: {
      type: String,
      default: null
    },
    safetyBackupFilename: {
      type: String,
      default: null
    },
    restoredCounts: {
      houses: { type: Number, default: 0 },
      owners: { type: Number, default: 0 },
      familyMembers: { type: Number, default: 0 },
      beats: { type: Number, default: 0 },
      villages: { type: Number, default: 0 },
      users: { type: Number, default: 0 },
      housePhotos: { type: Number, default: 0 },
      settings: { type: Number, default: 0 },
      totalDocuments: { type: Number, default: 0 },
      photoFilesRestored: { type: Number, default: 0 }
    },
    verifiedSuccessfully: {
      type: Boolean,
      default: false
    },
    verificationReport: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
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
    restoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    restoredByName: {
      type: String,
      default: 'Admin'
    },
    errorDetails: {
      type: String,
      default: null
    },
    ipAddress: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Index for chronological retrieval
restoreRecordSchema.index({ createdAt: -1 });

module.exports = mongoose.model('RestoreRecord', restoreRecordSchema);
