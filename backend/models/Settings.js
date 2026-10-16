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
      default: 'Notice: This official summary report is issued for municipal administrative and census reference purposes. It does not constitute a legal property ownership deed or land boundary title.'
    },
    allowedHouseTypes: {
      type: [String],
      default: ['Independent house', 'Apartment', 'Rental house', 'Other']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Settings', settingsSchema);
