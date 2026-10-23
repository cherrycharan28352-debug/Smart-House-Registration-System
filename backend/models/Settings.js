const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      default: 'Smart House Registration & Census Authority'
    },
    department: {
      type: String,
      default: 'Department of Housing and Urban Planning'
    },
    contactEmail: {
      type: String,
      default: 'housing-registry@gov.portal.local'
    },
    contactPhone: {
      type: String,
      default: '+91 800-456-7890'
    },
    address: {
      type: String,
      default: 'Civic Center, Administrative Block IV, Central District'
    },
    defaultMapLat: {
      type: Number,
      default: 28.6139
    },
    defaultMapLng: {
      type: Number,
      default: 77.2090
    },
    defaultZoom: {
      type: Number,
      default: 13
    },
    pdfDisclaimer: {
      type: String,
      default: ''
    },
    allowedHouseTypes: {
      type: [String],
      default: ['Independent house', 'Apartment', 'Rental house', 'Other']
    },
    backupSettings: {
      autoBackupEnabled: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'manual'],
        default: 'daily'
      },
      retentionDays: {
        type: Number,
        default: 30
      },
      lastBackupAt: {
        type: Date,
        default: null
      },
      nextBackupAt: {
        type: Date,
        default: null
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Settings', settingsSchema);
