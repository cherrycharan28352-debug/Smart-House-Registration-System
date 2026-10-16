const mongoose = require('mongoose');

const gpsSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    },
    accuracy: {
      type: Number,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      enum: ['gps', 'manual', 'map_click'],
      default: 'map_click'
    }
  },
  { _id: false }
);

const issueSchema = new mongoose.Schema(
  {
    issueId: {
      type: String,
      default: () => 'ISS-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000)
    },
    dateReported: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['Police-related', 'Other department', 'ಪೊಲೀಸ್ ಇಲಾಖೆ', 'ಇತರ ಇಲಾಖೆ'],
      default: 'Police-related'
    },
    description: {
      type: String,
      required: [true, 'Issue or suggestion description is required'],
      trim: true
    },
    additionalRemarks: {
      type: String,
      trim: true,
      default: ''
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedByName: {
      type: String,
      default: ''
    },
    // Action Taken on Issues or Suggestions (Admin-managed)
    actionTaken: {
      type: String,
      trim: true,
      default: ''
    },
    responsibleDepartment: {
      type: String,
      trim: true,
      default: 'Police Department'
    },
    actionDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending'
    },
    followUpRemarks: {
      type: String,
      trim: true,
      default: ''
    },
    actionUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    actionUpdatedByName: {
      type: String,
      default: ''
    },
    actionUpdatedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

const securitySchema = new mongoose.Schema(
  {
    cctvInstalled: {
      type: String,
      enum: ['Yes', 'No', 'ಹೌದು', 'ಇಲ್ಲ'],
      default: 'No'
    },
    securityGuardPresent: {
      type: String,
      enum: ['Yes', 'No', 'ಹೌದು', 'ಇಲ್ಲ'],
      default: 'No'
    },
    otherArrangements: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
);

const houseSchema = new mongoose.Schema(
  {
    houseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    houseNumber: {
      type: String,
      required: [true, 'House number is required'],
      trim: true
    },
    streetName: {
      type: String,
      trim: true,
      default: ''
    },
    beatNumber: {
      type: String,
      required: [true, 'Beat number is required'],
      trim: true,
      default: 'Beat 01'
    },
    village: {
      type: String,
      required: [true, 'Village name is required'],
      trim: true
    },
    villageRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Village'
    },
    locality: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    subdistrict: {
      type: String,
      trim: true,
      default: ''
    },
    district: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: 'Karnataka'
    },
    pincode: {
      type: String,
      trim: true,
      default: ''
    },
    houseType: {
      type: String,
      enum: ['Independent house', 'Apartment', 'Rental house', 'Other'],
      default: 'Independent house',
      index: true
    },
    numberOfFloors: {
      type: Number,
      min: [1, 'Number of floors must be at least 1'],
      default: 1
    },
    numberOfRooms: {
      type: Number,
      min: [1, 'Number of rooms must be at least 1'],
      default: 1
    },
    ownershipType: {
      type: String,
      enum: ['Owned', 'Rented', 'Other'],
      default: 'Owned'
    },
    gps: {
      type: gpsSchema,
      required: false,
      default: null
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    registrationStatus: {
      type: String,
      enum: ['Registered', 'Pending Verification', 'Approved', 'Flagged'],
      default: 'Registered',
      index: true
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner'
    },
    familyMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyMember'
      }
    ],
    photos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HousePhoto'
      }
    ],
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Security Present on Premises / ಭದ್ರತಾ ವ್ಯವಸ್ಥೆ
    security: {
      type: securitySchema,
      default: () => ({
        cctvInstalled: 'No',
        securityGuardPresent: 'No',
        otherArrangements: ''
      })
    },
    // Issues and Suggestions Received / ಸ್ವೀಕರಿಸಲಾದ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಸಲಹೆಗಳು
    issues: [issueSchema]
  },
  {
    timestamps: true
  }
);

// Compound indexes for scaling to 200,000+ records
houseSchema.index({ beatNumber: 1, village: 1 });
houseSchema.index({ createdAt: -1 });
houseSchema.index({ houseNumber: 1, village: 1 });
houseSchema.index({ 'gps.latitude': 1, 'gps.longitude': 1 });
houseSchema.index({ 'issues.status': 1 });
houseSchema.index({ 'issues.category': 1 });
houseSchema.index({ 'security.cctvInstalled': 1 });

// Virtual field for full address
houseSchema.virtual('fullAddress').get(function () {
  const parts = [
    this.houseNumber,
    this.streetName,
    this.locality,
    this.city,
    this.subdistrict,
    this.district,
    this.state,
    this.pincode
  ].filter(Boolean);
  return parts.join(', ');
});

houseSchema.set('toJSON', { virtuals: true });
houseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('House', houseSchema);
